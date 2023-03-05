
var path = require("path");
const extractFrames = require('ffmpeg-extract-frames')



const LIST_PATHS = [
    "/hdd/Videos/portfolio project/booking",
    "/hdd/Videos/portfolio project/buy-or-rent",
    "/hdd/Videos/portfolio project/coach-2",
    "/hdd/Videos/portfolio project/facebook-crawler-2",
    "/hdd/Videos/portfolio project/makita3",
    "/hdd/Videos/portfolio project/posthog",
    "/hdd/Videos/portfolio project/serverless-cv",
    "/hdd/Videos/portfolio project/shop-2_Lossless",
    "/hdd/Videos/portfolio project/webrtc-2-faster",
    "/hdd/Videos/portfolio project/youtube---faster"]


async function asyncCall(relPath) {
  const fileName = path.basename(relPath);
  console.log(fileName)
  // multi thread the creation of thumbnail preview
  await extractFrames({
    input: fileName,
    output: path.join('/hdd/Videos/portfolio project/output',`${fileName}-frame-%d.png`),
    numFrames:10
    })

}


const readPaths=()=>{
  LIST_PATHS.forEach((filepath)=>{
    asyncCall(filepath);

  })
}

readPaths()


  