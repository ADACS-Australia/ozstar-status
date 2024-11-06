import json
import os

from ssh import check_ssh_login_nodes
from slurm import check_slurm_partitions

# Define the file path
STATUS_FILE_PATH = '/var/spool/jobmon/status/status.json'

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

    # Combine the status into a single response
    status = {
        'login_nodes': login_nodes,
        'slurm_queues': slurm_queues
    }

    # Save the status to a JSON file
    with open(STATUS_FILE_PATH, 'w') as f:
        json.dump(status, f)


if __name__ == '__main__':
    fetch_and_save_status()