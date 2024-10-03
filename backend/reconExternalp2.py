import json
import nmap
import nvdlib
import pyxploitdb
from neo4j import GraphDatabase
import time
from collections import defaultdict


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
    seen_exploits = set() 

    try: 
        for cve_id in cve_ids: 
            print(f"Searching exploits for CVE: {cve_id}") 
            exploits = pyxploitdb.searchCVE(cve_id) 
            exploit_results[cve_id] = [] 

            for exploit in exploits: 
                exploit_id = exploit.id 
                exploit_key = (cve_id, exploit_id) 
                if exploit_key in seen_exploits:
                    continue      

                seen_exploits.add(exploit_key)
      
                exploit_info = { 
                    'id': exploit.id, 
                    'description': exploit.description, 
                    'type': exploit.type, 
                    'platform': exploit.platform, 
                    'verified': exploit.verified, 
                    'port': exploit.port, 
                    'link': exploit.link 
                } 
                exploit_results[cve_id].append(exploit_info) 
        print("Exploit results: ", exploit_results)
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

#-----------------------------------------------------Below code for hypothesis------------------------------------------

def create_cve_exploit_mapping(scan_results, exploit_results):
    cve_exploit_mapping = [
        {"product": port_info["Product"], "version": port_info["Version"], "cve_id": cve_id, "exploit": exploit}
        for cve_id, exploits in exploit_results.items()
        for exploit in exploits
        for host_info in scan_results
        for port_info in host_info["Ports"]
    ]
    return cve_exploit_mapping

def generate_attack_tree(scan_results, cve_exploit_mapping):
    attack_tree = defaultdict(list)
    for host_info in scan_results:
        ip = host_info.get("IP Address", "")
        for port_info in host_info.get("Ports", []):
            service = port_info.get("Service", "")
            product = port_info.get("Product", "")
            version = port_info.get("Version", "")
            
            for cve_exploit in cve_exploit_mapping:
                if cve_exploit["product"] == product and cve_exploit["version"] == version:
                    attack_tree[ip].append({
                        "Service": service,
                        "Product": product,
                        "Version": version,
                        "CVE": cve_exploit["cve_id"],
                        "Exploit": cve_exploit["exploit"]
                    })
    return attack_tree

def generate_hypotheses(attack_tree):
    hypotheses = []
    for ip, attacks in attack_tree.items():
        for attack in attacks:
            # Safely retrieve CVE and Exploit information
            cve = attack.get("CVE", "unknown CVE")
            exploit = attack.get("Exploit", "unknown exploit")
            
            hypothesis = {
                "Hypothesis": f"Compromise possible on {ip} through the exploit - {exploit} exploiting the vuilnerability - {cve}"
            }
            hypotheses.append(hypothesis)
    return hypotheses