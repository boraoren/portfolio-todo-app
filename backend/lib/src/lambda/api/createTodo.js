import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
import { getToken, parseUserId } from '../../auth/utils';
export const handler = async (event) => {
    console.info(`createTodo is processing event`);
    const newTodo = JSON.parse(event.body);
    const jwtToken = getToken(event.headers.Authorization);
    console.info(`Received JWT token: ${jwtToken}`);
    const newItem = await createTodoService(newTodo, jwtToken);
    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item: newItem
        })
    };
};
export async function createTodoService(createTodoRequest, jwtToken) {
    const todoId = uuid.v4();
    const userId = parseUserId(jwtToken);
    return await createTodoResource({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        task: createTodoRequest.task,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: undefined
    });
}
export async function createTodoResource(todo) {
    console.info(`Creating a Todo item with todoId ${todo.todoId}`);
    const documentClient = new AWS.DynamoDB.DocumentClient();
    await documentClient.put({
        TableName: process.env.TODO_TABLE,
        Item: todo
    }).promise();
    return todo;
}
//# sourceMappingURL=createTodo.js.map