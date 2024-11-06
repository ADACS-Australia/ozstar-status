import socket

def check_ssh_login_nodes(login_nodes):
    """
    Check if SSH login to each login node is available by checking if port 22 is listening.

    Args:
        login_nodes (list): List of login node hostnames or IP addresses.

    Returns:
        dict: Dictionary with login node names as keys and availability status as values.
    """
    ssh_port = 22
    timeout = 5  # seconds
    status = {}

    for node in login_nodes:
        try:
            with socket.create_connection((node, ssh_port), timeout):
                status[node] = 'up'
        except (socket.timeout, socket.error):
            status[node] = 'down'

    return status

# Example usage
if __name__ == "__main__":
    login_nodes = [
        'tooarrana1.hpc.swin.edu.au',
        'tooarrana2.hpc.swin.edu.au',
        'farnarkle1.hpc.swin.edu.au',
        'farnarkle2.hpc.swin.edu.au',
    ]
    status = check_ssh_login_nodes(login_nodes)
    print(status)