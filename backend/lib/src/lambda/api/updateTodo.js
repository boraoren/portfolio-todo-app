import 'source-map-support/register';
import { getToken, parseUserId } from '../../auth/utils';
import * as AWS from "aws-sdk";
export const handler = async (event) => {
    console.log(`updateTodo is processing event`);
    const todoId = event.pathParameters.todoId;
    const updatedTodo = JSON.parse(event.body);
    const jwtToken = getToken(event.headers.Authorization);
    const changedTodo = await updateTodoService(todoId, updatedTodo, jwtToken);
    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item: changedTodo
        })
    };
};
export async function updateTodoService(todoId, updatedTodo, jwtToken) {
    const activeUser = parseUserId(jwtToken);
    return await updateTodoResource(todoId, updatedTodo, activeUser);
}
export async function updateTodoResource(todoId, updatedTodo, activeUser) {
    console.log(`dataLayer updateTodo updating item with todoId ${todoId}`);
    const params = {
        TableName: process.env.TODO_TABLE,
        Key: { todoId },
        UpdateExpression: 'set task = :t, dueDate = :dD, done = :d',
        ConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':t': updatedTodo.task,
            ':dD': updatedTodo.dueDate,
            ':d': updatedTodo.done,
            ':userId': activeUser
        },
        ReturnValues: "ALL_NEW"
    };
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const result = await documentClient.update(params).promise();
    console.log(`todo updated,  result is : ${result}`);
    return result;
}
//# sourceMappingURL=updateTodo.js.map