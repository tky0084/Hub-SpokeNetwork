{
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "routeTables_rt_Spoke1_prod_default_01_name": {
            "defaultValue": "rt-Spoke1-prod-default-01",
            "type": "String"
        },
        "virtualMachines_vm_spoke1_prod_Public_01_name": {
            "defaultValue": "vm-spoke1-prod-Public-01",
            "type": "String"
        },
        "adminUsername": { "type": "string" },
        "adminPassword": { "type": "securestring" },
        "virtualNetworks_vnet_Spoke1_prod_network_01_name": {
            "defaultValue": "vnet-Spoke1-prod-network-01",
            "type": "String"
        },
        "networkInterfaces_vm_spoke1_prod_public_01420_name": {
            "defaultValue": "vm-spoke1-prod-public-01420",
            "type": "String"
        },
        "networkSecurityGroups_vm_spoke1_prod_Public_01_nsg_name": {
            "defaultValue": "vm-spoke1-prod-Public-01-nsg",
            "type": "String"
        },
        "virtualNetworks_vnet_hub_prod_network_01_externalid": {
            "defaultValue": "/subscriptions/68990dcd-fb41-4bb2-aba3-cbfeceab1ab9/resourceGroups/Hub-Network/providers/Microsoft.Network/virtualNetworks/vnet-hub-prod-network-01",
            "type": "String"
        }
    },
    "variables": {},
    "resources": [
        {
            "type": "Microsoft.Network/networkSecurityGroups",
            "apiVersion": "2024-07-01",
            "name": "[parameters('networkSecurityGroups_vm_spoke1_prod_Public_01_nsg_name')]",
            "location": "japaneast",
            "properties": {
                "securityRules": []
            }
        },
        {
            "type": "Microsoft.Network/routeTables",
            "apiVersion": "2024-07-01",
            "name": "[parameters('routeTables_rt_Spoke1_prod_default_01_name')]",
            "location": "japaneast",
            "properties": {
                "disableBgpRoutePropagation": true,
                "routes": [
                    {
                        "name": "default",
                        "id": "[resourceId('Microsoft.Network/routeTables/routes', parameters('routeTables_rt_Spoke1_prod_default_01_name'), 'default')]",
                        "properties": {
                            "addressPrefix": "0.0.0.0/0",
                            "nextHopType": "VirtualAppliance",
                            "nextHopIpAddress": "10.0.0.4"
                        },
                        "type": "Microsoft.Network/routeTables/routes"
                    }
                ]
            }
        },
        {
            "type": "Microsoft.Compute/virtualMachines",
            "apiVersion": "2024-11-01",
            "name": "[parameters('virtualMachines_vm_spoke1_prod_Public_01_name')]",
            "location": "japaneast",
            "dependsOn": [
                "[resourceId('Microsoft.Network/networkInterfaces', parameters('networkInterfaces_vm_spoke1_prod_public_01420_name'))]"
            ],
            "properties": {
                "hardwareProfile": {
                    "vmSize": "Standard_D2s_v3"
                },
                "additionalCapabilities": {
                    "hibernationEnabled": false
                },
                "storageProfile": {
                    "imageReference": {
                        "publisher": "MicrosoftWindowsServer",
                        "offer": "WindowsServer",
                        "sku": "2025-datacenter-azure-edition",
                        "version": "latest"
                    },
                    "osDisk": {
                        "osType": "Windows",
                        "name": "[concat(parameters('virtualMachines_vm_spoke1_prod_Public_01_name'), '_OsDisk_1_b768b99b9db5471f8e111b0a0ef5cfb4')]",
                        "createOption": "FromImage",
                        "caching": "ReadWrite",
                        "managedDisk": {
                            "storageAccountType": "Premium_LRS"
                        },
                        "deleteOption": "Delete",
                        "diskSizeGB": 127
                    },
                    "dataDisks": [],
                    "diskControllerType": "SCSI"
                },
                "osProfile": {
                    "computerName": "vm-spoke1-prod-",
                    "adminUsername": "[parameters('adminUsername')]",
                    "adminPassword": "[parameters('adminPassword')]",
                    "windowsConfiguration": {
                        "provisionVMAgent": true,
                        "enableAutomaticUpdates": true,
                        "patchSettings": {
                            "patchMode": "AutomaticByPlatform",
                            "automaticByPlatformSettings": {
                                "rebootSetting": "IfRequired"
                            },
                            "assessmentMode": "ImageDefault",
                            "enableHotpatching": true
                        }
                    },
                    "secrets": [],
                    "allowExtensionOperations": true
                },
                "networkProfile": {
                    "networkInterfaces": [
                        {
                            "id": "[resourceId('Microsoft.Network/networkInterfaces', parameters('networkInterfaces_vm_spoke1_prod_public_01420_name'))]",
                            "properties": {
                                "deleteOption": "Detach"
                            }
                        }
                    ]
                },
                "diagnosticsProfile": {
                    "bootDiagnostics": {
                        "enabled": true
                    }
                }
            }
        },
        {
            "type": "Microsoft.Network/routeTables/routes",
            "apiVersion": "2024-07-01",
            "name": "[concat(parameters('routeTables_rt_Spoke1_prod_default_01_name'), '/default')]",
            "dependsOn": [
                "[resourceId('Microsoft.Network/routeTables', parameters('routeTables_rt_Spoke1_prod_default_01_name'))]"
            ],
            "properties": {
                "addressPrefix": "0.0.0.0/0",
                "nextHopType": "VirtualAppliance",
                "nextHopIpAddress": "10.0.0.4"
            }
        },
        {
            "type": "Microsoft.Network/virtualNetworks",
            "apiVersion": "2024-07-01",
            "name": "[parameters('virtualNetworks_vnet_Spoke1_prod_network_01_name')]",
            "location": "japaneast",
            "dependsOn": [
                "[resourceId('Microsoft.Network/routeTables', parameters('routeTables_rt_Spoke1_prod_default_01_name'))]"
            ],
            "properties": {
                "addressSpace": {
                    "addressPrefixes": [
                        "10.0.1.0/24"
                    ]
                },
                "encryption": {
                    "enabled": false,
                    "enforcement": "AllowUnencrypted"
                },
                "privateEndpointVNetPolicies": "Disabled",
                "subnets": [
                    {
                        "name": "default",
                        "id": "[resourceId('Microsoft.Network/virtualNetworks/subnets', parameters('virtualNetworks_vnet_Spoke1_prod_network_01_name'), 'default')]",
                        "properties": {
                            "addressPrefixes": [
                                "10.0.1.0/27"
                            ],
                            "routeTable": {
                                "id": "[resourceId('Microsoft.Network/routeTables', parameters('routeTables_rt_Spoke1_prod_default_01_name'))]"
                            },
                            "delegations": [],
                            "privateEndpointNetworkPolicies": "Disabled",
                            "privateLinkServiceNetworkPolicies": "Enabled",
                            "defaultOutboundAccess": false
                        },
                        "type": "Microsoft.Network/virtualNetworks/subnets"
                    }
                ],
                "virtualNetworkPeerings": [],
                "enableDdosProtection": false
            }
        },
        {
            "type": "Microsoft.Network/networkInterfaces",
            "apiVersion": "2024-07-01",
            "name": "[parameters('networkInterfaces_vm_spoke1_prod_public_01420_name')]",
            "location": "japaneast",
            "dependsOn": [
                "[resourceId('Microsoft.Network/virtualNetworks/subnets', parameters('virtualNetworks_vnet_Spoke1_prod_network_01_name'), 'default')]",
                "[resourceId('Microsoft.Network/networkSecurityGroups', parameters('networkSecurityGroups_vm_spoke1_prod_Public_01_nsg_name'))]"
            ],
            "kind": "Regular",
            "properties": {
                "ipConfigurations": [
                    {
                        "name": "ipconfig1",
                        "id": "[concat(resourceId('Microsoft.Network/networkInterfaces', parameters('networkInterfaces_vm_spoke1_prod_public_01420_name')), '/ipConfigurations/ipconfig1')]",
                        "type": "Microsoft.Network/networkInterfaces/ipConfigurations",
                        "properties": {
                            "privateIPAddress": "10.0.1.4",
                            "privateIPAllocationMethod": "Dynamic",
                            "subnet": {
                                "id": "[resourceId('Microsoft.Network/virtualNetworks/subnets', parameters('virtualNetworks_vnet_Spoke1_prod_network_01_name'), 'default')]"
                            },
                            "primary": true,
                            "privateIPAddressVersion": "IPv4"
                        }
                    }
                ],
                "dnsSettings": {
                    "dnsServers": []
                },
                "enableAcceleratedNetworking": true,
                "enableIPForwarding": false,
                "disableTcpStateTracking": false,
                "networkSecurityGroup": {
                    "id": "[resourceId('Microsoft.Network/networkSecurityGroups', parameters('networkSecurityGroups_vm_spoke1_prod_Public_01_nsg_name'))]"
                },
                "nicType": "Standard",
                "auxiliaryMode": "None",
                "auxiliarySku": "None"
            }
        },
        {
            "type": "Microsoft.Network/virtualNetworks/subnets",
            "apiVersion": "2024-07-01",
            "name": "[concat(parameters('virtualNetworks_vnet_Spoke1_prod_network_01_name'), '/default')]",
            "dependsOn": [
                "[resourceId('Microsoft.Network/virtualNetworks', parameters('virtualNetworks_vnet_Spoke1_prod_network_01_name'))]",
                "[resourceId('Microsoft.Network/routeTables', parameters('routeTables_rt_Spoke1_prod_default_01_name'))]"
            ],
            "properties": {
                "addressPrefixes": [
                    "10.0.1.0/27"
                ],
                "routeTable": {
                    "id": "[resourceId('Microsoft.Network/routeTables', parameters('routeTables_rt_Spoke1_prod_default_01_name'))]"
                },
                "delegations": [],
                "privateEndpointNetworkPolicies": "Disabled",
                "privateLinkServiceNetworkPolicies": "Enabled",
                "defaultOutboundAccess": false
            }
        }
    ]
}
