import platform, subprocess

def ping(host:str)->bool:
    param="-n" if platform.system().lower()=="windows" else "-c"
    cmd=["ping",param,"1",host]
    return subprocess.run(cmd,capture_output=True).returncode==0
