import json
import nmap
import nvdlib
import pyxploitdb
from neo4j import GraphDatabase
import time


def search_cve(keyword):
    try:
        cve_results = nvdlib.searchCVE(keywordSearch=keyword)
        search_results = []
        for cve in cve_results:
            result = {
                "id": cve.id,
                "keyword": keyword,
                "published": cve.published,
                "lastModified": cve.lastModified,
                "vulnStatus": cve.vulnStatus,
                "score": cve.score,
            }
            search_results.append(result)
        return search_results
    except Exception as e:
        print(f"An error occurred during CVE search: {e}")
        return []


def search_exploits_for_cves(cve_ids):
    exploit_results = {}
    try:
        for cve_id in cve_ids:
            print(f"Searching exploits for CVE: {cve_id}")
            exploits = pyxploitdb.searchCVE(cve_id)
            exploit_results[cve_id] = []
            for exploit in exploits:
                exploit_info = {
                    "id": exploit.id,
                    "cve_id": cve_id,
                    "description": exploit.description,
                    "type": exploit.type,
                    "platform": exploit.platform,
                    "verified": exploit.verified,
                    "port": exploit.port,
                    "link": exploit.link,
                }
                exploit_results[cve_id].append(exploit_info)
        return exploit_results
    except Exception as e:
        print(f"An error occurred during exploit search: {e}")
        return {}


def get_cve_ids_from_scan_results(scan_results):
    cve_ids = []
    for host_info in scan_results:
        for port_info in host_info["Ports"]:
            product = port_info["Product"]
            if product:
                print(f"Searching CVEs for product: {product}")
                cve_results = search_cve(product)
                if cve_results:
                    print("CVEs found:")
                    print(json.dumps(cve_results, indent=4))
                    cve_ids.extend(cve_result["id"] for cve_result in cve_results)
                else:
                    print("No CVEs found for this product.")
            else:
                print("No product information available for this port.")
    return cve_ids


def perform_nmap_scan(network_id, cidr):
    nm = nmap.PortScanner()
    target = f"{network_id}/{cidr}"
    nm.scan(hosts=target, arguments="-sS -sV -O")

    scan_results = []
    for host in nm.all_hosts():
        host_info = {
            "IP_Address": host,
            "Host_Status": nm[host].state(),
            "Ports": [],
            "OS_CPE": "",
            "Aggressive_OS_guesses": "",
        }

        for proto in nm[host].all_protocols():
            for port in nm[host][proto].keys():
                port_info = nm[host][proto][port]
                port_details = {
                    "Port": port,
                    "State": port_info["state"],
                    "Service": port_info["name"],
                    "Product": port_info["product"],
                    "Version": port_info["version"],
                }
                host_info["Ports"].append(port_details)

        os_info = nm[host].get("osclass", [])
        if os_info:
            host_info["OS_CPE"] = os_info[0]["osclass"]

        aggressive_os_guesses = nm[host].get("osmatch", [])
        if aggressive_os_guesses:
            host_info["Aggressive_OS_guesses"] = aggressive_os_guesses[0]["osclass"]

        scan_results.append(host_info)

    return scan_results


# --------------------------------------------------------------------Neo4j code------------------------------------------------------


def connect_to_neo4j():
    # load_status = dotenv.load_dotenv("Neo4j-3bd16a0a-Created-2024-04-24.txt")
    # if load_status is False:
    #     raise RuntimeError('Environment variables not loaded.')
    # else:
    #     print("Connected to instance")
    URI = "bolt://localhost:7687"
    AUTH = ("neo4j", "Network@123")
    try:
        driver = GraphDatabase.driver(URI, auth=AUTH)
        return driver
    except Exception as e:
        print(f"An error occurred while connecting to Neo4j: {e}")
        return None


def execute_cypher_queries(driver, cypher_queries):
    if driver is None:
        raise ValueError("Error: Neo4j driver not initialized.")

    # Start a new session and transaction for executing queries
    with driver.session() as session:
        try:
            # Start an explicit transaction
            with session.begin_transaction() as tx:
                # for query in cypher_queries:
                tx.run(cypher_queries)
                time.sleep(3)
                tx.commit()
            print("All queries executed successfully.")
        except Exception as e:
            print(f"An error occurred while executing Cypher queries: {e}")
            # Optionally, add a transaction rollback here
            raise


def generate_cypher_queries(hosts):
    cypher_query = "CREATE"

    # Create START node
    cypher_query += '(s:START {name: "START"})'

    # Create Host nodes and relationships
    for i, host in enumerate(hosts, start=1):
        cypher_query += f',(h{i}:HOST {{ip_address: "{host["IP_Address"]}", host_status: "{host["Host_Status"]}", os_cpe: "{host["OS_CPE"]}"}})'

        # Create Port nodes and relationships for each host
        for j, port in enumerate(host["Ports"], start=1):
            cypher_query += f',(p{i}_{j}:PORT {{port: {port["Port"]}, state: "{port["State"]}", service: "{port["Service"]}", product: "{port["Product"]}", version: "{port["Version"]}"}})'
            cypher_query += f",(h{i})-[:HAS_PORT]->(p{i}_{j})"

            # Create Product nodes and relationships for each port
            cypher_query += f',(prod{i}_{j}:PRODUCT {{name: "{port["Product"]}"}})'
            cypher_query += f",(p{i}_{j})-[:HAS_PRODUCT]->(prod{i}_{j})"

            # Search for vulnerabilities related to the product
            keyword = f"{port['Service']} {port['Product']} {port['Version']}"
            cve_results = search_cve(keyword)
            if cve_results:
                for k, cve_result in enumerate(cve_results, start=1):
                    cypher_query += f',(vuln{i}_{j}_{k}:VULNERABILITY {{id: "{cve_result["id"]}", published: "{cve_result["published"]}", score: "{cve_result["score"]}"}})'
                    cypher_query += (
                        f",(prod{i}_{j})-[:HAS_VULNERABILITY]->(vuln{i}_{j}_{k})"
                    )

                    # Search for exploits related to the vulnerability
                    exploit_results = search_exploits_for_cves([cve_result["id"]])
                    if exploit_results:
                        for l, exploit_info in enumerate(
                            exploit_results[cve_result["id"]], start=1
                        ):
                            cypher_query += f',(exploit{i}_{j}_{k}_{l}:EXPLOIT {{id: "{exploit_info["id"]}", description: "{exploit_info["description"]}"}})'
                            cypher_query += f",(vuln{i}_{j}_{k})-[:HAS_EXPLOIT]->(exploit{i}_{j}_{k}_{l})"

    # Create relationships between all Host nodes and the START node
    for i, _ in enumerate(hosts, start=1):
        cypher_query += f",(s)-[:CONNECTED_TO]->(h{i})"

    cypher_query += ";"

    return cypher_query
