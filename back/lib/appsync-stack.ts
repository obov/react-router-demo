import * as cdk from "aws-cdk-lib";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export class AppSyncStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // AppSync API 생성
    const api = new appsync.GraphqlApi(this, "Api", {
      name: "demo-api",
      schema: appsync.SchemaFile.fromAsset("graphql/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
    });

    // None 데이터소스 생성
    const noneDS = api.addNoneDataSource("noneDS", {
      name: "NoneDataSource",
    });

    // 리졸버 생성
    const resolver = noneDS.createResolver("GetExampleResolver", {
      typeName: "Query",
      fieldName: "getExample",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`{
        "version": "2018-05-29",
        "payload": {
          "message": "Hello from AppSync!"
        }
      }`),
      responseMappingTemplate: appsync.MappingTemplate.fromString(
        `$util.toJson($context.result)`
      ),
    });

    // SSM Parameter Store에 출력값 등록
    new ssm.StringParameter(this, "GraphQLAPIURLParameter", {
      parameterName: "/appsync/api-url",
      stringValue: api.graphqlUrl,
    });

    new ssm.StringParameter(this, "GraphQLAPIKeyParameter", {
      parameterName: "/appsync/api-key",
      stringValue: api.apiKey || "",
    });

    // CloudFormation 출력
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    });

    new cdk.CfnOutput(this, "GraphQLAPIID", {
      value: api.apiId,
    });

    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || "",
    });
  }
}
