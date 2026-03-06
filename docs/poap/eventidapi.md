/event/{id}/poaps

# /event/{id}/poaps

For the specified event ID, this endpoint returns paginated info on the token holders including the token ID, POAP transfer count, and the owner's information like address, amount of POAPs owned, and ENS.

# OpenAPI definition

```json
{
  "openapi": "3.0.1",
  "info": {
    "title": "Integrators Production API",
    "description": "Endpoint for public API & 3rd party integrations",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://api.poap.tech"
    }
  ],
  "paths": {
    "/event/{id}/poaps": {
      "get": {
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "limit": {
                      "type": "number",
                      "description": "The amount of results per response (max = 300).",
                      "minimum": 0,
                      "maximum": 300,
                      "default": 10
                    },
                    "offset": {
                      "type": "number",
                      "description": "The offset to paginate the results.",
                      "default": 0,
                      "minimum": 0
                    },
                    "total": {
                      "type": "number",
                      "description": "The total number of results to paginate."
                    },
                    "transferCount": {
                      "type": "number",
                      "description": "The total number of tokens transfers."
                    },
                    "tokens": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "created": {
                            "type": "string",
                            "description": "The time the POAP was minted in GnosisChain."
                          },
                          "migrated": {
                            "type": "string",
                            "description": "The time the POAP was migrated to Ethereum Mainnet."
                          },
                          "id": {
                            "type": "string",
                            "description": "The unique POAP token ID.",
                            "example": "3010642"
                          },
                          "owner": {
                            "type": "object",
                            "properties": {
                              "id": {
                                "type": "string",
                                "description": "The POAP owner's address.",
                                "example": "0x19C234364C70E45287B631BAA04e42BA58173f54"
                              },
                              "tokensOwned": {
                                "type": "number",
                                "description": "The number of POAPs held by the owner's address."
                              },
                              "ens": {
                                "type": "string",
                                "description": "The POAP owner's ENS address. If no reverse ENS resolution exists an empty string will be returned."
                              }
                            }
                          },
                          "transferCount": {
                            "type": "string",
                            "description": "The number of times the POAP has been transferred."
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "x-amazon-apigateway-integration": {
          "httpMethod": "GET",
          "uri": "https://${stageVariables.poapServerInternalDomain}/event/{id}/poaps",
          "responses": {
            "default": {
              "statusCode": "200",
              "responseParameters": {
                "method.response.header.Access-Control-Allow-Origin": "'*'"
              }
            }
          },
          "requestParameters": {
            "integration.request.header.x-poap-gateway": "stageVariables.serverApiGwKey",
            "integration.request.header.requestid": "context.requestId",
            "integration.request.header.x-gateway-source": "'poap-public-api'",
            "integration.request.header.apiKeyId": "context.identity.apiKeyId",
            "integration.request.header.auth0-consumer-id": "context.authorizer.consumerId",
            "integration.request.path.id": "method.request.path.id"
          },
          "passthroughBehavior": "when_no_match",
          "connectionId": "rgv50m",
          "connectionType": "VPC_LINK",
          "type": "http_proxy",
          "contentHandling": "CONVERT_TO_TEXT"
        },
        "parameters": [
          {
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            },
            "name": "id",
            "description": "The numeric ID of the event."
          },
          {
            "name": "limit",
            "in": "query",
            "schema": {
              "type": "number",
              "description": "The amount of results per response (max = 300).",
              "minimum": 0,
              "maximum": 300,
              "default": 10
            },
            "description": "The amount of results per response (max = 300)."
          },
          {
            "name": "offset",
            "in": "query",
            "schema": {
              "type": "number",
              "description": "The offset to paginate the results.",
              "default": 0,
              "minimum": 0
            },
            "description": "The offset to paginate the results."
          }
        ],
        "summary": "/event/{id}/poaps",
        "description": "For the specified event ID, this endpoint returns paginated info on the token holders including the token ID, POAP transfer count, and the owner's information like address, amount of POAPs owned, and ENS.",
        "tags": [
          "Tokens"
        ],
        "operationId": "GET:/event/*/poaps",
        "x-amazon-apigateway-request-validator": "Validate query string parameters and headers",
        "security": [
          {
            "api_key": []
          }
        ]
      }
    }
  },
  "components": {
    "securitySchemes": {
      "api_key": {
        "type": "apiKey",
        "name": "x-api-key",
        "in": "header"
      }
    }
  },
  "x-amazon-apigateway-request-validators": {
    "Validate query string parameters and headers": {
      "validateRequestParameters": true,
      "validateRequestBody": false
    }
  },
  "x-amazon-apigateway-binary-media-types": [
    "multipart/form-data"
  ]
}
```