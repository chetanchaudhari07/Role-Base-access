const UserManagement = () => {
    const users = [
        { id: 1, name: "Chetan", role: "Admin" },
        { id: 2, name: "piyush", role: "User" },
    ];

    return (
        <div>
            <h2>User Management</h2>

            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Role</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.role}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;