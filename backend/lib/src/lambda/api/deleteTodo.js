import 'source-map-support/register';
import { getToken, parseUserId } from '../../auth/utils';
import * as AWS from "aws-sdk";
export const handler = async (event) => {
    console.log(`deleteTodo is processing event`);
    const todoId = event.pathParameters.todoId;
    const jwtToken = getToken(event.headers.Authorization);
    const deletedTodo = await deleteTodoService(todoId, jwtToken);
    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item: deletedTodo
        })
    };
};
export async function deleteTodoService(todoId, jwtToken) {
    const activeUser = parseUserId(jwtToken);
    return await deleteTodoResource(todoId, activeUser);
}
export async function deleteTodoResource(todoId, activeUser) {
    console.log(`Deleting item with userId ${activeUser} and todoId ${todoId}`);
    const params = {
        TableName: process.env.TODO_TABLE,
        Key: { todoId },
        ConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': activeUser
        },
        ReturnValues: "ALL_OLD"
    };
    const documentClient = new AWS.DynamoDB.DocumentClient();
    return await documentClient.delete(params).promise();
}
//# sourceMappingURL=deleteTodo.js.map