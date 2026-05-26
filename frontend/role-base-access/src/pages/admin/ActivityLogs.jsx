const ActivityLogs = () => {
    const logs = [
        "User Rahul logged in",
        "Admin updated task status",
        "New user registered",
    ];

    return (
        <div>
            <h2>Activity Logs</h2>

            <ul>
                {logs.map((log, index) => (
                    <li key={index}>{log}</li>
                ))}
            </ul>
        </div>
    );
};

export default ActivityLogs;