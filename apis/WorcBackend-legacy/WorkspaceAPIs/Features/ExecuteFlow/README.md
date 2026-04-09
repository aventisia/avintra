### User flow

1. User create a flow in reactflow canvas by adding node after node.
2. User adds few conditional node which will have 2 or more branches.
3. User adds loop node which will have a branch that will loop back to the same node here and there in the flow.
4. User saves the flow and clicks on execute button.
5. If user does not save the flow and clicks on execute button, then we will show a confirmation dialog to user that there are unsaved changes in the flow, do you want to save the flow before executing? If user clicks on yes, then we will save the flow and execute it, if user clicks on no, then we will execute the flow without saving it or if he cancels the dialog, then we will not execute the flow.
5. If the flow has only the start node and placeholder nodes, then the give message to user that the flow is empty and cannot be executed.
6. User will be able to see the execution status of each node in the flow in real time.
7. While execution is happening, user can hover over the executed node to see the logged input and output data of that node.
8. If any node fails during execution, user will be able to see the error message and the flow will stop executing further nodes.
9. If the flow executes successfully, user will see a success message at the end of the flow execution.

### Technical flow

1. When user clicks on execute button, /execute-flow/execute or something similar endpoint is called.
2. Validate flow version id and check if the flow is in executable state. If not, return an error message to the user.
3. Check if user or the api key (if the flow is triggered via external API) has the necessary permissions to execute the flow. If not, return an error message to the user.
4. The backend will fetch the flow metadata and nodes and edges array from the database using the flowVersionId.
5. Parse the reactflowObject to create a structured representation of the flow that can be easily processed by the ExecutorLibrary.
6. Create a Job in the database to track the execution of the flow. This job will have a unique jobId that will be used to log the execution status and input/output data of each node in the flow.
7. Sends a notification to frontend that the flow execution has started and provide the jobId for real-time updates.
8. Parsed flow data will be passed to the ExecutorLibrary's FlowProcessor for execution.
9. FlowProcessor will pick the first "startNode" node from nodes list in the flow and starts a while loop which will continue until there are no more nodes to execute.
10. Inside the while loop, FlowProcessor will execute the current node and update the execution status of the node in the database.
11. If the node execution is successful, FlowProcessor will check for the next nodes to execute based on the edges array and the output of the current node.
12. If there are conditional nodes, FlowProcessor will evaluate the conditions and determine which branch to execute next.
13. If conditional node has multiple branches, FlowProcessor will execute the branch whose condition is satisfied and skip the other branches.
14. If there is a loop node, FlowProcessor will execute the loop body and then check the loop condition to determine whether to execute the loop body again or move to the next node.
15. If any node execution fails, FlowProcessor will update the execution status of the node as "failed" in the database and stop the execution of further nodes.
16. If the flow executes successfully, FlowProcessor will update the execution status of all nodes as "success" in the database and return a success message to the user.
17. The frontend will listen for real-time updates on the execution status of each node and display it to the user.
18. The frontend will also listen for real-time updates on the logged input and output data of each node and display it to the user when they hover over the executed node.

### Node execution flow

1. The ExecutorLibrary will have a NodeProcessor class that will be responsible for executing individual nodes based on their type and the input data. This class will have methods for executing different types of nodes such as action nodes, conditional nodes, and loop nodes.
2. The NodeProcessor will use a strategy pattern to determine which execution method to call based on the node type. For example, if the node is an action node, it will call the executeActionNode method, if it's a conditional node, it will call the executeConditionalNode method, and if it's a loop node, it will call the executeLoopNode method.
3. Each execution method in the NodeProcessor will handle the specific logic for executing that type of node. For example, the executeActionNode method will handle the logic for executing an action node, which may involve making an API call or performing some computation. The executeConditionalNode method will handle the logic for evaluating the conditions and determining which branch to execute next. The executeLoopNode method will handle the logic for executing the loop body and checking the loop condition.
4. The NodeProcessor will also handle error handling and logging for each node execution. If any node execution fails, the NodeProcessor will log the error message and update the execution status of the node as "failed" in the database. It will also stop the execution of further nodes in the flow.
5. The NodeProcessor will return the output data of each node execution, which will be used by the FlowProcessor to determine the next nodes to execute based on the edges array and the output of the current node. The output data will also be logged and displayed to the user in real time when they hover over the executed node.
6. The NodeProcessor will be designed to be extensible, allowing for the addition of new node types and execution logic in the future as needed. This will ensure that the ExecutorLibrary can evolve and adapt to new requirements and use cases over time.

### Phase 1: Implement execute endpoint only without flow execution
Part 1: Make only the required modificaiton on the frontend to call the execute endpoint when user clicks on execute button. We will pass the flowVersionId and user authentication token in the request without implementing the backend logic of execute endpoint.

Part 2: Implement the execute endpoint in the backend to validate the flow version id, check permissions, fetch flow metadata and create a job in the database. We will also send a notification to frontend that the flow execution has started and provide the jobId for real-time updates. However, we will not implement the actual flow execution logic in this phase, and we will just return a success message to the user after creating the job. This will allow us to test the end-to-end flow execution process without actually executing the nodes in the flow.

> removing the API key from executeFlow feature since this will be validated by the webhook trigger feature and that feature is going to call _executeFlowService.ExecuteFlowAsync for published flow execution

### Phase 2: Implement only the FlowProcessor to process the flow without NodeProcessor. In this phase, we will mock the node execution and just focus on the flow processing logic, including handling of conditional nodes and loop nodes.

### Phase 3: Implement the NodeProcessor to execute individual nodes based on their type and input data. In this phase, we will implement the actual execution logic for different types of nodes and integrate it with the FlowProcessor to enable end-to-end flow execution.
