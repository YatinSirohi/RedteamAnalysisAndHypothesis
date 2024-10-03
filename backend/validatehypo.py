import nmap
import json
import nvdlib
import pyxploitdb

#---------------------------new additions---------------------------------------------- start ------------------------------------

from collections import defaultdict
import nltk
from nltk.corpus import stopwords
from datetime import datetime

# Download the stopwords list from nltk
nltk.download('stopwords')

# Set of stopwords (common words to ignore)
stop_words = set(stopwords.words('english'))

# Define cyber attack-related keywords (can be customized as per your context)
cyber_attack_keywords = set([
    "attack", "payload", "injection", "privilege",
    "escalation", "bypass", "CVE", "reverse shell", "malware", "ransomware",
    "phishing", "denial", "service", "bruteforce", "remote code", "command", "injection", "password", 
    "detected", "privilege", "escalation", "termination", "EoTS", "DNS", "unauthenticated", "remote"
])

def extract_keywords(text):
    # Split the text into words and convert to lowercase for consistent comparison
    words = set(text.lower().split())
    #print(f"Original Words: {words}")  
    
    meaningful_words = words - stop_words
    #print(f"Words After Stopwords Removal: {meaningful_words}")  
    
    # Only keep words related to cyber attack scenarios
    extracted_keywords = {word for word in meaningful_words if word in cyber_attack_keywords}
    #print(f"Extracted Keywords: {extracted_keywords}") 
    
    return extracted_keywords

#---------------------------new additions---------------------------------------------- end ------------------------------------

#---------------------------changes---------------------------------------------- start ----------------------------------------

''' i added year filtration here to reduce the number of cve coming in the output '''

def search_cve(keyword, min_year=2014):
    try:
        # Get the current year for dynamic filtering
        current_year = datetime.now().year
        
        # Search for CVEs using the keyword
        cve_results = nvdlib.searchCVE(keywordSearch=keyword)
        search_results = []
        
        for cve in cve_results:
            cve_id = cve.id
            cve_year = int(cve_id.split('-')[1])  
            
            # Filter based on the min_year and current year
            if min_year <= cve_year <= current_year:
                result = {
                    'id': cve.id,
                    'published': cve.published,
                    'lastModified': cve.lastModified,
                    'vulnStatus': cve.vulnStatus,
                    'score': cve.score,
                    'description': cve.descriptions[0].value if cve.descriptions else 'No description available', 
                }
                search_results.append(result)
        
        return search_results

    except Exception as e:
        print(f"An error occurred during CVE search: {e}")
        return []

#---------------------changes---------------------------------------------------------  below function as well

''' i added description, ip, product,service as well as it is neede fro final output. I deleted cve_exploit mapping function and passing all this details from this function itself. '''

def get_cve_ids_and_descriptions(scan_results):
    cve_list = []
    for host_info in scan_results:
        ip = host_info["IP_Address"]
        for port_info in host_info["Ports"]:
            product = port_info.get("Product")
            service = port_info.get("Service")
            if product:
                print(f"Searching CVEs for product: {product}")
                cve_results = search_cve(product)
                if cve_results:
                    print("CVEs found:")
                    print(json.dumps(cve_results, indent=4))
                    for cve_result in cve_results:
                        cve_list.append({
                            "ip" : ip,
                            "product": product,
                            "service" : service,
                            "id": cve_result["id"],
                            "description": cve_result.get("description", "No description available")
                        })
                else:
                    print("No CVEs found for this product.")
            else:
                print("No product information available for this port.")
    return cve_list

#---------------------changes---------------------------------------------------------  end ---------------------------------

def perform_nmap_scan(network_id, cidr):
    nm = nmap.PortScanner()
    target = f"{network_id}/{cidr}"
    nm.scan(hosts=target, arguments='-sS -sV -O')
    
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
                #print(f"Port: {port}, Info: {port_info}")
                port_details = {
                    "Port": port,
                    "State": port_info["state"],
                    "Service": port_info["name"],
                    "Product": port_info["product"],
                    "Version": port_info["version"]
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
  
#---------------------------changes---------------------------------------------- start ----------------------------------------

'''now cve_info contains all details from cve search. earlier it was only cve id.  '''
    
def search_exploits_for_cves(cve_info):
    exploit_results = {}
    exploit_count = 0

    try:
        for cve in cve_info:
            cve_id = cve["id"]
            cve_description = cve["description"]
            product = cve["product"]
            service = cve["service"]
            ip = cve["ip"]
            print(f"Searching exploits for CVE: {cve_id}")
            
            # Search for exploits related to the CVE
            exploits = pyxploitdb.searchCVE(cve_id)

            # Initialize CVE entry in results
            exploit_results[cve_id] = {
                "ip": ip,
                "product": product,
                "service": service,
                "description": cve_description,
                "exploits": {}
            }
            
            for exploit in exploits:
                exploit_id = exploit.id
                exploit_info = {
                    'id': exploit.id,
                    'description': exploit.description,
                    'type': exploit.type,
                    'platform': exploit.platform,
                    'verified': exploit.verified,
                    'port': exploit.port,
                    'link': exploit.link
                }
                exploit_results[cve_id]["exploits"][exploit_id] = exploit_info

            if exploit_results[cve_id]["exploits"]:
                exploit_count += 1

        print(f"Total CVEs with available exploits: {exploit_count}")
        return exploit_results

    except Exception as e:
        print(f"An error occurred during exploit search: {e}")
        return {}
        
#---------------------------changes---------------------------------------------- below function as well ----------------------------------------

''' I changed attack tree as I deleted cve_exploit mapping. It was the one creating duplicates before as the mapping was not correct. not is is using the return from search_exploits_for_cves for generating attak tree '''

def generate_attack_tree(exploit_results):
    attack_tree = defaultdict(list)  # Use defaultdict with list to store exploits

    for cve_id, exploit_info in exploit_results.items():
        ip = exploit_info.get("ip", "")
        service = exploit_info.get("service", "")
        product = exploit_info.get("product", "")
        cve_description = exploit_info.get("description", "No description available")
        exploits = exploit_info.get("exploits", {})

        # Create a base entry for each CVE
        attack_entry = {
            "IP": ip,
            "Service": service,
            "Product": product,
            "CVE": cve_id,
            "CVE Description": cve_description,
            "Exploits": []  # Initialize an empty list for exploits
        }

        # If there are exploits, add them to the entry
        for exploit_id, exploit in exploits.items():
            attack_entry["Exploits"].append({
                "Exploit ID": exploit_id,
                "Exploit Description": exploit.get("description", "No description available"),
                "Type" : exploit.get("type"),
                "Link" : exploit.get("link")
            })

        # Append the attack entry to the attack tree under the CVE ID
        attack_tree[ip].append(attack_entry)

    return attack_tree

#---------------------------changes---------------------------------------------- below function as well ----------------------------------------  

# chnages are done as the attack tree structre changed and we need to consider both vulnerabilities with and without available exploits.

def generate_hypotheses(attack_tree):
    hypotheses = []

    for ip, exploit_info_list in attack_tree.items():
        for exploit_info in exploit_info_list:
            cve_id = exploit_info.get("CVE", "Unknown CVE")
            cve_description = exploit_info.get("CVE Description", "No description available")
            exploits = exploit_info.get("Exploits", [])

            # Generate a hypothesis based on the CVE information
            hypothesis_text = (
                f"Vulnerability on {ip} with CVE ID {cve_id} (Description: {cve_description}) "
            )

            if exploits:
                # If there are exploits, create a detailed hypothesis
                for exploit in exploits:
                    exploit_id = exploit.get("Exploit ID", "Unknown Exploit ID")
                    exploit_description = exploit.get("Exploit Description", "No description available")
                    exploit_platform = exploit.get("Platform", "unknown platform")
                    exploit_verified = exploit.get("Verified", False)

                    hypothesis_text += (
                        f"can be exploited using exploit {exploit_id} on {exploit_platform}. "
                        f"Exploit details: {exploit_description}. Verified: {exploit_verified}. "
                    )
            else:
                # If no exploits are available, note that
                hypothesis_text += "No known exploits available for this vulnerability."

            # Create a hypothesis dictionary and append it to the hypotheses list
            hypothesis = {
                "Hypothesis": hypothesis_text,
            }

            hypotheses.append(hypothesis)

    return hypotheses



def validate_hypotheses(hypotheses, logs):
    validated_hypotheses = []

    for hypothesis in hypotheses:
        hypothesis_text = hypothesis.get('Hypothesis Text', '')
        hypothesis_keywords = extract_keywords(hypothesis_text)
        supported = False
        matching_keywords = []
        matching_logs = []  # Capture all matching logs instead of just one
        
        # Iterate over logs to find matching keywords
        for log in logs:
            if isinstance(log, dict) and "Description" in log:
                log_description = log["Description"].lower()
                log_keywords = extract_keywords(log_description)
                
                # Check if there is any overlap between hypothesis keywords and log keywords
                matching_words = hypothesis_keywords & log_keywords
                
                if matching_words:
                    supported = True
                    matching_keywords.extend(list(matching_words))  # Add all matching keywords
                    matching_logs.append(log)  # Store the matching log for later use

        # If supported, add the hypothesis and matching logs to the validated hypotheses
        if supported:
            validated_hypotheses.append({
                'Hypothesis': hypothesis,
                'Matching Logs': matching_logs,  # Store all matching logs
                'Matching Keywords': matching_keywords
            })
    return validated_hypotheses
    
#---------------------------changes---------------------------------------------- end ----------------------------------------

#-----------------------------------------new addition----------------------------------------------------------------------

def load_windows_logs(log_file_path):
    with open(log_file_path, 'r') as log_file:
        return json.load(log_file)

def main():
    network_id = input("Enter the network ID (e.g., 192.168.1.0): ")
    cidr = input("Enter the CIDR value (e.g., 24): ")

    print("Starting Nmap scan...")
    scan_results = perform_nmap_scan(network_id, cidr)  

    print("Fetching CVEs for scanned services...")
    cve_info = get_cve_ids_and_descriptions(scan_results)
    
    print("Fetching Exploits for discovered CVEs...")
    exploit_results = search_exploits_for_cves(cve_info)

    attack_tree = generate_attack_tree(exploit_results)
    print("Generated Attack Tree:")
    print(json.dumps(attack_tree, indent=4))

    print("Generating hypotheses...")
    hypotheses = generate_hypotheses(attack_tree)
    print(json.dumps(hypotheses, indent=4))

    print("Loading logs for hypothesis validation...")
    log_file_path = "windowslogs.json"
    logs = load_windows_logs(log_file_path)

    print("Validating hypotheses based on logs...")
    validated_hypotheses = validate_hypotheses(hypotheses, logs)
    
    print("Final validated hypotheses:")
    print(json.dumps(validated_hypotheses, indent=4))

if __name__ == "__main__":
    main()
