import json
import os
from datetime import datetime, timedelta

from ssh import check_ssh_login_nodes
from slurm import check_slurm_partitions

# Define the file path
STATUS_FILE_PATH = '/var/spool/jobmon/status/status.json'
UPTIME_FILE_PATH = '/var/spool/jobmon/status/uptime.json'

def fetch_and_save_status():
    # Define the login nodes
    login_nodes_list = [
        'tooarrana1.hpc.swin.edu.au',
        'tooarrana2.hpc.swin.edu.au',
        'farnarkle1.hpc.swin.edu.au',
        'farnarkle2.hpc.swin.edu.au',
        ]

    # Check the SSH login status of the login nodes
    login_nodes = check_ssh_login_nodes(login_nodes_list)

    # # Simulate login nodes status
    # login_nodes = {
    #     'tooarrana1': 'up',
    #     'tooarrana2': 'up',
    #     'farnarkle1': 'down',
    #     'farnarkle2': 'up'
    # }

    # Define the SLURM partitions
    slurm_partitions = ['milan', 'skylake', 'trevor']

    # Check the SLURM partition status
    slurm_queues = check_slurm_partitions(slurm_partitions)

    # # Simulate SLURM queue status
    # slurm_queues = {
    #     'milan': 'up',
    #     'skylake': 'down',
    #     'trevor': 'up'
    # }

    # Normalize the timestamp to the beginning of the hour
    now = datetime.utcnow()
    timestamp = now.replace(minute=0, second=0, microsecond=0).isoformat()

    # Combine the status into a single response
    status = {
        'timestamp': timestamp,
        'login_nodes': login_nodes,
        'slurm_queues': slurm_queues
    }

    # Create a condensed status that shows down, partial, or up based on each of the sub-statuses
    def get_condensed_status(statuses):
        if all(s == 'up' for s in statuses.values()):
            return 'up'
        elif all(s == 'down' for s in statuses.values()):
            return 'down'
        else:
            return 'partial'

    condensed_status = {
        'timestamp': timestamp,
        'login_nodes': get_condensed_status(login_nodes),
        'slurm_queues': get_condensed_status(slurm_queues),
    }

    # Save the status to a JSON file
    with open(STATUS_FILE_PATH, 'w') as f:
        json.dump(status, f)

    # Append the status to the uptime file
    if os.path.exists(UPTIME_FILE_PATH):
        with open(UPTIME_FILE_PATH, 'r') as f:
            uptime_data = json.load(f)
    else:
        uptime_data = []

    # Check if an entry already exists for this hour
    existing_entry = next((entry for entry in uptime_data if entry['timestamp'] == timestamp), None)

    if existing_entry:
        # Update the status using an "and" operation
        for key in ['login_nodes', 'slurm_queues']:
            if existing_entry[key] == 'down' or condensed_status[key] == 'down':
                existing_entry[key] = 'down'
            elif existing_entry[key] == 'partial' or condensed_status[key] == 'partial':
                existing_entry[key] = 'partial'
    else:
        uptime_data.append(condensed_status)

    # Keep only the last 24 hours of data
    cutoff_time = now - timedelta(hours=24)
    uptime_data = [entry for entry in uptime_data if datetime.fromisoformat(entry['timestamp']) > cutoff_time]

    with open(UPTIME_FILE_PATH, 'w') as f:
        json.dump(uptime_data, f)


if __name__ == '__main__':

    fetch_and_save_status()