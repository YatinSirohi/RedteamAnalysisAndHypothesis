from flask import Flask, request, jsonify
from flask_cors import CORS
import reconExternalp2
import json


app = Flask(__name__)
CORS(app)


@app.route("/Reconext", methods=["GET"])
def reconExtContent():
    target_ip = request.args.get("target_ip")
    cidr = request.args.get("cidr")
    print("starting scan")
    scan_results = reconExternalp2.perform_nmap_scan(target_ip, cidr)
    scan_results_json = json.dumps(scan_results)
    data = {"content": scan_results_json}
    return data


@app.route("/Reconext/Cve", methods=["GET"])
def reconCveContent():
    target_ip = request.args.get("target_ip")
    cidr = request.args.get("cidr")
    scan_results = reconExternalp2.perform_nmap_scan(target_ip, cidr)
    print("Getting Cve")
    for host_info in scan_results:
        for port_info in host_info["Ports"]:
            product = port_info["Product"]
            if product:
                cve_results = reconExternalp2.search_cve(product)
                if cve_results:
                    cve_json_output = json.dumps(cve_results)
                    cve = {"cve": [cve_json_output]}
                    return cve


@app.route("/Reconext/Exploit", methods=["GET"])
def reconExplotContent():
    target_ip = request.args.get("target_ip")
    cidr = request.args.get("cidr")
    scan_results = reconExternalp2.perform_nmap_scan(target_ip, cidr)
    print("Getting exploits")
    cve_ids = reconExternalp2.get_cve_ids_from_scan_results(scan_results)
    exploit_results = reconExternalp2.search_exploits_for_cves(cve_ids)
    for cve_id, exploits in exploit_results.items():
        if exploits:
            print(f"Exploits found for CVE {cve_id}:")
            exploit_json_output = json.dumps(exploits)
            exploit = {"exploit": [exploit_json_output]}
            return exploit


# -------------------------------Below function is to get scan resule in a json file---------------------


@app.route("/Reconext/CommonJson", methods=["GET"])
def commonJson():
    target_ip = request.args.get("target_ip")
    cidr = request.args.get("cidr")
    scan_results = reconExternalp2.perform_nmap_scan(target_ip, cidr)

    formatted_host_info_list = []
    for host_info in scan_results:
        formatted_host_info = {
            "IP_Address": host_info["IP_Address"],
            "Host_Status": host_info["Host_Status"],
            "Ports": host_info["Ports"],
            "OS_CPE": host_info["OS_CPE"],
            "Aggressive_OS_guesses": host_info["Aggressive_OS_guesses"],
        }
        formatted_host_info_list.append(formatted_host_info)

    print("Scan completed")

    formatted_cve_result_list = []
    for host_info in scan_results:
        for port_info in host_info["Ports"]:
            product = port_info["Product"]
            if product:
                cve_results = reconExternalp2.search_cve(product)
                for cve_result in cve_results:
                    formatted_cve_result = {
                        "id": cve_result["id"],
                        "keyword": cve_result[
                            "keyword"
                        ],  # Link between CVE and nmap scan, keyword=product
                        "published": cve_result["published"],
                        "lastModified": cve_result["lastModified"],
                        "vulnStatus": cve_result["vulnStatus"],
                        "score": cve_result["score"],
                    }
                    formatted_cve_result_list.append(formatted_cve_result)

    print("CVE scan completed")

    cve_ids = [cve["id"] for cve in formatted_cve_result_list if "id" in cve]
    exploit_results = reconExternalp2.search_exploits_for_cves(cve_ids)
    exploit_formatted = []

    for cve_id, exploits in exploit_results.items():
        if exploits:
            print(f"Exploits found for CVE {cve_id}:")
            for exploit in exploits:
                exploit_formatted.append(
                    {
                        "id": exploit["id"],
                        "cve_id": exploit[
                            "cve_id"
                        ],  # Link between CVE and exploits, id of cve = cve_id
                        "type": exploit["type"],
                        "platform": exploit["platform"],
                        "port": exploit["port"],
                        "description": exploit["description"],
                    }
                )

    print("Exploit scan completed")
    print("saving in json")
    with open("json_data.json", "w") as f:
        json.dump(formatted_host_info_list, f)
    with open("json_data_cve.json", "w") as f:
        json.dump(formatted_cve_result_list, f)
    with open("json_data_exploit.json", "w") as f:
        json.dump(exploit_formatted, f)

    return "JSON files created"


@app.route("/Reconext/graph", methods=["GET"])
def graph_of_state():

    target_ip = request.args.get("target_ip")
    cidr = request.args.get("cidr")
    print("started scan")
    scan_results = reconExternalp2.perform_nmap_scan(target_ip, cidr)

    formatted_host_info_list = []
    for host_info in scan_results:
        formatted_host_info = {
            "IP_Address": host_info["IP_Address"],
            "Host_Status": host_info["Host_Status"],
            "Ports": host_info["Ports"],
            "OS_CPE": host_info["OS_CPE"],
            "Aggressive_OS_guesses": host_info["Aggressive_OS_guesses"],
        }
        formatted_host_info_list.append(formatted_host_info)
    print("executed")
    return formatted_host_info_list


@app.route("/Reconext/exploit-graph", methods=["GET"])
def graph_of_exploit():
    target_ip = request.args.get("target_ip")
    cidr = request.args.get("cidr")
    scan_results = reconExternalp2.perform_nmap_scan(target_ip, cidr)
    print("Getting exploits")
    cve_ids = reconExternalp2.get_cve_ids_from_scan_results(scan_results)
    exploit_results = reconExternalp2.search_exploits_for_cves(cve_ids)
    exploit_list = []
    # for cve_id, exploits in exploit_results.items():
    #     if exploits not in exploit_list:
    #         print("Exploits found for CVE ",cve_id,": ",exploits)
    #         # exploit_json_output = json.dumps(exploits)
    #         exploit_list.append(exploits)
    # print("\n\nExploit list results for graph: ", exploit_list)
    # return exploit_list
    for key, value in exploit_results.items():
        exploit_list.append({"cve_id": key, "exploits": value})
    return exploit_list

@app.route("/Reconext/hypothesis", methods=["GET"])
def hypthesis():
    target_ip = request.args.get("target_ip")
    cidr = request.args.get("cidr")
    scan_results = reconExternalp2.perform_nmap_scan(target_ip, cidr)
    cve_ids = reconExternalp2.get_cve_ids_from_scan_results(scan_results)
    exploit_results = reconExternalp2.search_exploits_for_cves(cve_ids)
    cve_exploit_mapping = reconExternalp2.create_cve_exploit_mapping(scan_results, exploit_results)
    attack_tree = reconExternalp2.generate_attack_tree(scan_results, cve_exploit_mapping)
    hypothesis = reconExternalp2.generate_hypotheses(attack_tree)
    print("\nGenerated Hypotheses:")
    print(json.dumps(hypothesis, indent=4))
    return hypothesis


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
