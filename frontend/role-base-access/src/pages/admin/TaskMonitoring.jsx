const TaskMonitoring = () => {
    const tasks = [
        { id: 1, title: "Frontend UI", status: "Completed" },
        { id: 2, title: "Backend API", status: "Pending" },
    ];

    return (
        <div>
            <h2>Task Monitoring</h2>

            {tasks.map((task) => (
                <div key={task.id}>
                    <h4>{task.title}</h4>
                    <p>{task.status}</p>
                </div>
            ))}
        </div>
    );
};

export default TaskMonitoring;