
#!/usr/bin/env bash

readonly OUTPUT_PORT=8080
readonly CAMERA_WIDTH=720
readonly CAMERA_HEIGHT=480
readonly FPS=32

readonly -a DEPENDENCIES=("vlc")

# Check if all of this program's dependencies are loaded
for dependency in ${DEPENDENCIES[@]}; do
  module_check=$(dpkg-query --show --showformat='${Status}\n' "${dependency}" \
    | grep "install ok installed")

  if [ "${module_check}" != "install ok installed" ]; then
    echo
    echo "program dependency ${dependency} is not installed"
    echo "please install it by executing 'sudo apt-get install ${dependency}'"
    exit 1
  else
    echo "successfully loaded module ${dependency}"
  fi
done

echo "all dependencies are loaded!"
echo

echo "OUTPUT_PORT: ${OUTPUT_PORT}"
echo "FPS: ${FPS}"
echo "CAMERA DIMENSIONS: (${CAMERA_WIDTH}, ${CAMERA_HEIGHT})"
echo
echo "raspivid output:"

# Start the camera feed from the PiCamera, streaming to ${OUTPUT_PORT}
raspivid -o - -t 0 -hf -w ${CAMERA_WIDTH} -h ${CAMERA_HEIGHT} -fps ${FPS} \
| cvlc stream:///dev/stdin --sout '#standard{access=http,mux=ts,dst=:${OUTPUT_PORT}}' :demux=h264
