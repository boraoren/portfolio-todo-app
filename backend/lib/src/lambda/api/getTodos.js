import 'source-map-support/register';
import { getToken, parseUserId } from '../../auth/utils';
import * as AWS from "aws-sdk";
export const handler = async (event) => {
    const jwtToken = getToken(event.headers.Authorization);
    console.log(`Received JWT token: ${jwtToken}`);
    const todos = await getAllTodosService(jwtToken);
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            items: todos
        })
    };
};
export async function getAllTodosService(jwtToken) {
    const activeUser = parseUserId(jwtToken);
    return await getAllTodosResource(activeUser);
}
export async function getAllTodosResource(activeUser) {
    console.log(`Getting all Todos for user: ${activeUser}`);
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: process.env.TODO_TABLE,
        IndexName: process.env.INDEX_USER_ID,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': activeUser
        },
        ScanIndexForward: false
    };
    const result = await documentClient.query(params).promise();
    const todos = result.Items;
    console.table(todos);
    return todos;
}
//# sourceMappingURL=getTodos.js.map