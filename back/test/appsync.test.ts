import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import fetch from "node-fetch";

describe("AppSync API E2E Tests", () => {
  let apiUrl: string;
  let apiKey: string;

  beforeAll(async () => {
    // SSM Client 초기화
    const ssmClient = new SSMClient({ region: "ap-northeast-2" });

    // API URL 가져오기
    const urlParam = await ssmClient.send(
      new GetParameterCommand({ Name: "/appsync/api-url" })
    );
    apiUrl = urlParam.Parameter?.Value || "";
    expect(apiUrl).toBeTruthy();

    // API Key 가져오기
    const keyParam = await ssmClient.send(
      new GetParameterCommand({ Name: "/appsync/api-key" })
    );
    apiKey = keyParam.Parameter?.Value || "";
    expect(apiKey).toBeTruthy();
  });

  it("should return message using API key", async () => {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        query: `
          query {
            getExample {
              message
            }
          }
        `,
      }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data?.getExample?.message).toBe("Hello from AppSync!");
  });

  it("should reject request without API key", async () => {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query {
            getExample {
              message
            }
          }
        `,
      }),
    });

    expect(response.status).toBe(401);
  });
});
