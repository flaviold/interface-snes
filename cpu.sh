#/bin/bash/
#grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage}'
PY_COMMAND="import psutil;import numpy;print(round(numpy.array(psutil.cpu_percent(percpu=True)).mean(),1))"
echo $( python -c "${PY_COMMAND}" )
