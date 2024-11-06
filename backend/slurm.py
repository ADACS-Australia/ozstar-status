import subprocess
import os

def check_slurm_partitions(partitions, slurm_bin_path='/apps/slurm/latest/bin/'):
    """
    Check the state of each SLURM partition.

    Args:
        partitions (list): List of SLURM partition names.

    Returns:
        dict: Dictionary with partition names as keys and their states as values.
    """
    status = {}

    for partition in partitions:
        try:
            result = subprocess.run(
                [os.path.join(slurm_bin_path, 'scontrol'), 'show', 'partition', partition],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                output = result.stdout
                if 'State=UP' in output:
                    status[partition] = 'up'
                else:
                    status[partition] = 'down'
            else:
                status[partition] = 'unknown'
        except subprocess.TimeoutExpired:
            status[partition] = 'unknown'
        except Exception as e:
            status[partition] = 'unknown'

    return status

# Example usage
if __name__ == "__main__":
    partitions = ['milan', 'skylake', 'trevor']
    status = check_slurm_partitions(partitions)
    print(status)