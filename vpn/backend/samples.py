"""
Pre-built Sample Scenarios for IPsec VPN Assessment Demonstration.
"""

from typing import Dict, Any, List


SAMPLE_SCENARIOS = {
    "optimal": {
        "id": "optimal",
        "title": "Modern Zero-Trust VPN (Optimal / Grade A+)",
        "config_type": "swanctl",
        "raw_config": """connections {
    cloud-gateway {
        version = 2
        proposals = aes256gcm16-prfsha256-ecp256
        rekey_time = 1h
        local {
            auth = pubkey
            certs = gatewayCert.pem
        }
        remote {
            auth = pubkey
        }
        children {
            net {
                local_ts = 10.0.0.0/16
                remote_ts = 192.168.1.0/24
                esp_proposals = aes256gcm16-ecp256
                rekey_time = 1h
                dpd_action = clear
            }
        }
    }
}""",
        "flow_type": "none"
    },

    "legacy": {
        "id": "legacy",
        "title": "Legacy Enterprise VPN (High Risk / Grade D)",
        "config_type": "ipsec.conf",
        "raw_config": """config setup
    strictcrlpolicy=no

conn legacy-hq-tunnel
    keyexchange=ikev1
    authby=secret
    ike=3des-md5-modp1024!
    esp=3des-md5!
    ikelifetime=86400s
    keylife=86400s
    pfs=no
    auto=start
    left=192.168.10.1
    right=203.0.113.5""",
        "flow_type": "none"
    },

    "branch_misconfig": {
        "id": "branch_misconfig",
        "title": "Branch Office Misconfigured (Moderate Risk / Grade C)",
        "config_type": "cisco",
        "raw_config": """crypto ikev2 policy 10
 encryption aes-128
 integrity sha1
 group 14
 lifetime 28800

crypto map CMAP 10 ipsec-ikev2
 set peer 198.51.100.2
 set transform-set TS1
 set authentication pre-share
! PFS disabled""",
        "flow_type": "none"
    },

    "sequence_anomaly": {
        "id": "sequence_anomaly",
        "title": "Protocol Sequence & Timing Anomaly (Grade C-)",
        "config_type": "swanctl",
        "raw_config": """connections {
    branch-link {
        version = 2
        proposals = aes256gcm16-prfsha256-modp2048
        rekey_time = 2h
        local { auth = psk }
        children {
            esp_proposals = aes256gcm16-modp2048
        }
    }
}""",
        "flow_type": "sequence_anomaly"
    }
}
