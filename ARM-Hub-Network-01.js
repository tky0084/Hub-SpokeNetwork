{
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "azureFirewalls_AFW_hub_prod_outbound_01_name": {
            "defaultValue": "AFW-hub-prod-outbound-01",
            "type": "String"
        },
        "virtualNetworks_vnet_hub_prod_network_01_name": {
            "defaultValue": "vnet-hub-prod-network-01",
            "type": "String"
        },
        "firewallPolicies_AFWP_hub_prod_outbound_01_name": {
            "defaultValue": "AFWP-hub-prod-outbound-01",
            "type": "String"
        },
        "publicIPAddresses_pip_hub_prod_Azurefirewall_01_name": {
            "defaultValue": "pip-hub-prod-Azurefirewall-01",
            "type": "String"
        },
        "virtualNetworks_vnet_Spoke1_prod_network_01_externalid": {
            "defaultValue": "/subscriptions/68990dcd-fb41-4bb2-aba3-cbfeceab1ab9/resourceGroups/Spoke1-Network/providers/Microsoft.Network/virtualNetworks/vnet-Spoke1-prod-network-01",
            "type": "String"
        }
    },
    "variables": {},
    "resources": [
        {
            "type": "Microsoft.Network/firewallPolicies",
            "apiVersion": "2024-07-01",
            "name": "[parameters('firewallPolicies_AFWP_hub_prod_outbound_01_name')]",
            "location": "japaneast",
            "properties": {
                "sku": {
                    "tier": "Premium"
                },
                "threatIntelMode": "Alert",
                "intrusionDetection": {
                    "mode": "Off"
                }
            }
        },
        {
            "type": "Microsoft.Network/publicIPAddresses",
            "apiVersion": "2024-07-01",
            "name": "[parameters('publicIPAddresses_pip_hub_prod_Azurefirewall_01_name')]",
            "location": "japaneast",
            "sku": {
                "name": "Standard",
                "tier": "Regional"
            },
            "properties": {
                "ipAddress": "4.189.128.113",
                "publicIPAddressVersion": "IPv4",
                "publicIPAllocationMethod": "Static",
                "idleTimeoutInMinutes": 4,
                "ipTags": []
            }
        },
        {
            "type": "Microsoft.Network/virtualNetworks",
            "apiVersion": "2024-07-01",
            "name": "[parameters('virtualNetworks_vnet_hub_prod_network_01_name')]",
            "location": "japaneast",
            "properties": {
                "addressSpace": {
                    "addressPrefixes": [
                        "10.0.0.0/24"
                    ]
                },
                "encryption": {
                    "enabled": false,
                    "enforcement": "AllowUnencrypted"
                },
                "privateEndpointVNetPolicies": "Disabled",
                "subnets": [
                    {
                        "name": "AzureFirewallSubnet",
                        "id": "[resourceId('Microsoft.Network/virtualNetworks/subnets', parameters('virtualNetworks_vnet_hub_prod_network_01_name'), 'AzureFirewallSubnet')]",
                        "properties": {
                            "addressPrefixes": [
                                "10.0.0.0/26"
                            ],
                            "delegations": [],
                            "privateEndpointNetworkPolicies": "Disabled",
                            "privateLinkServiceNetworkPolicies": "Enabled"
                        },
                        "type": "Microsoft.Network/virtualNetworks/subnets"
                    }
                ],
                "virtualNetworkPeerings": [
                    {
                        "name": "peer-hub-prod-toSpoke1-01",
                        "id": "[resourceId('Microsoft.Network/virtualNetworks/virtualNetworkPeerings', parameters('virtualNetworks_vnet_hub_prod_network_01_name'), 'peer-hub-prod-toSpoke1-01')]",
                        "properties": {
                            "peeringState": "Connected",
                            "peeringSyncLevel": "FullyInSync",
                            "remoteVirtualNetwork": {
                                "id": "[parameters('virtualNetworks_vnet_Spoke1_prod_network_01_externalid')]"
                            },
                            "allowVirtualNetworkAccess": true,
                            "allowForwardedTraffic": true,
                            "allowGatewayTransit": false,
                            "useRemoteGateways": false,
                            "doNotVerifyRemoteGateways": false,
                            "peerCompleteVnets": true,
                            "remoteAddressSpace": {
                                "addressPrefixes": [
                                    "10.0.1.0/24"
                                ]
                            },
                            "remoteVirtualNetworkAddressSpace": {
                                "addressPrefixes": [
                                    "10.0.1.0/24"
                                ]
                            }
                        },
                        "type": "Microsoft.Network/virtualNetworks/virtualNetworkPeerings"
                    }
                ],
                "enableDdosProtection": false
            }
        },
        {
            "type": "Microsoft.Network/firewallPolicies/ruleCollectionGroups",
            "apiVersion": "2024-07-01",
            "name": "[concat(parameters('firewallPolicies_AFWP_hub_prod_outbound_01_name'), '/DefaultApplicationRuleCollectionGroup')]",
            "location": "japaneast",
            "dependsOn": [
                "[resourceId('Microsoft.Network/firewallPolicies', parameters('firewallPolicies_AFWP_hub_prod_outbound_01_name'))]"
            ],
            "properties": {
                "priority": 300,
                "ruleCollections": [
                    {
                        "ruleCollectionType": "FirewallPolicyFilterRuleCollection",
                        "action": {
                            "type": "Allow"
                        },
                        "rules": [
                            {
                                "ruleType": "ApplicationRule",
                                "name": "rule",
                                "protocols": [
                                    {
                                        "protocolType": "Https",
                                        "port": 443
                                    }
                                ],
                                "fqdnTags": [],
                                "webCategories": [],
                                "targetFqdns": [
                                    "*.google.com"
                                ],
                                "targetUrls": [],
                                "terminateTLS": false,
                                "sourceAddresses": [
                                    "10.0.1.4"
                                ],
                                "destinationAddresses": [],
                                "sourceIpGroups": [],
                                "httpHeadersToInsert": []
                            }
                        ],
                        "name": "rc-Allow-basic-01",
                        "priority": 100
                    }
                ]
            }
        },
        {
            "type": "Microsoft.Network/virtualNetworks/subnets",
            "apiVersion": "2024-07-01",
            "name": "[concat(parameters('virtualNetworks_vnet_hub_prod_network_01_name'), '/AzureFirewallSubnet')]",
            "dependsOn": [
                "[resourceId('Microsoft.Network/virtualNetworks', parameters('virtualNetworks_vnet_hub_prod_network_01_name'))]"
            ],
            "properties": {
                "addressPrefixes": [
                    "10.0.0.0/26"
                ],
                "delegations": [],
                "privateEndpointNetworkPolicies": "Disabled",
                "privateLinkServiceNetworkPolicies": "Enabled"
            }
        },
        {
            "type": "Microsoft.Network/virtualNetworks/virtualNetworkPeerings",
            "apiVersion": "2024-07-01",
            "name": "[concat(parameters('virtualNetworks_vnet_hub_prod_network_01_name'), '/peer-hub-prod-toSpoke1-01')]",
            "dependsOn": [
                "[resourceId('Microsoft.Network/virtualNetworks', parameters('virtualNetworks_vnet_hub_prod_network_01_name'))]"
            ],
            "properties": {
                "peeringState": "Connected",
                "peeringSyncLevel": "FullyInSync",
                "remoteVirtualNetwork": {
                    "id": "[parameters('virtualNetworks_vnet_Spoke1_prod_network_01_externalid')]"
                },
                "allowVirtualNetworkAccess": true,
                "allowForwardedTraffic": true,
                "allowGatewayTransit": false,
                "useRemoteGateways": false,
                "doNotVerifyRemoteGateways": false,
                "peerCompleteVnets": true,
                "remoteAddressSpace": {
                    "addressPrefixes": [
                        "10.0.1.0/24"
                    ]
                },
                "remoteVirtualNetworkAddressSpace": {
                    "addressPrefixes": [
                        "10.0.1.0/24"
                    ]
                }
            }
        },
        {
            "type": "Microsoft.Network/azureFirewalls",
            "apiVersion": "2024-07-01",
            "name": "[parameters('azureFirewalls_AFW_hub_prod_outbound_01_name')]",
            "location": "japaneast",
            "dependsOn": [
                "[resourceId('Microsoft.Network/publicIPAddresses', parameters('publicIPAddresses_pip_hub_prod_Azurefirewall_01_name'))]",
                "[resourceId('Microsoft.Network/virtualNetworks/subnets', parameters('virtualNetworks_vnet_hub_prod_network_01_name'), 'AzureFirewallSubnet')]",
                "[resourceId('Microsoft.Network/firewallPolicies', parameters('firewallPolicies_AFWP_hub_prod_outbound_01_name'))]"
            ],
            "properties": {
                "sku": {
                    "name": "AZFW_VNet",
                    "tier": "Premium"
                },
                "threatIntelMode": "Alert",
                "additionalProperties": {},
                "ipConfigurations": [
                    {
                        "name": "pip-hub-prod-Azurefirewall-01",
                        "id": "[concat(resourceId('Microsoft.Network/azureFirewalls', parameters('azureFirewalls_AFW_hub_prod_outbound_01_name')), '/azureFirewallIpConfigurations/pip-hub-prod-Azurefirewall-01')]",
                        "properties": {
                            "publicIPAddress": {
                                "id": "[resourceId('Microsoft.Network/publicIPAddresses', parameters('publicIPAddresses_pip_hub_prod_Azurefirewall_01_name'))]"
                            },
                            "subnet": {
                                "id": "[resourceId('Microsoft.Network/virtualNetworks/subnets', parameters('virtualNetworks_vnet_hub_prod_network_01_name'), 'AzureFirewallSubnet')]"
                            }
                        }
                    }
                ],
                "networkRuleCollections": [],
                "applicationRuleCollections": [],
                "natRuleCollections": [],
                "firewallPolicy": {
                    "id": "[resourceId('Microsoft.Network/firewallPolicies', parameters('firewallPolicies_AFWP_hub_prod_outbound_01_name'))]"
                }
            }
        }
    ]
}
