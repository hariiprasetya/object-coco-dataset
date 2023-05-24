import Webcam from 'react-webcam';
import * as tf from "@tensorflow/tfjs"
import * as cocoModel from "@tensorflow-models/coco-ssd"
import { useEffect, useState, useRef } from 'react';

function App() {
  const [model, setModel] = useState("")
  const [detectData, setDetectData] = useState("")
  const [personData, setPersonData] = useState("")
  const [isDetecting, setIsDetecting] = useState(false)

  const intervalRef = useRef(null)

  async function loadModel() {
    try {
      const dataset= await cocoModel.load()
      setModel(dataset)
    } catch(err) {
      console.log(err)
    }
  }

  useEffect(() => {
    tf.ready().then(() => {
      loadModel()
    })
  }, [])

  useEffect(() => {
    if (detectData) {
      const personData = detectData.filter((obj) => obj.class === "person")
      setPersonData(personData) 
    }
  }, [detectData, setPersonData])

  const startDetection = () => {
    setIsDetecting(true)
  }

  const stopDetection = () => {
    setIsDetecting(false)
    clearInterval(intervalRef.current)
    setDetectData("")
    setPersonData("")
  }

  useEffect(() => {
    if (isDetecting) {
      intervalRef.current = setInterval(() => {
        handlePredict()
      }, 2000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isDetecting])

  async function handlePredict() {
    const detection = await model.detect(document.getElementById("videoSource"))
    console.log(detection)
    if (detection.length > 0) {
      setDetectData(detection)
    }
  }

  const camOption = {
    width: 720,
    height: 480,
    facingMode: "environtment"
  }

  return (
    <div className=" flex flex-col justify-center items-center w-full bg-black h-screen text-white">
      <h1 className="text-xl font-bold">Human Counting and Object Detection</h1>
      <div className='flex justify-center py-2'>
        <Webcam className='rounded-md' id='videoSource' audio={false} videoConstraints={camOption}/>
      </div>
      
      <div> {isDetecting ? (
        <button className='bg-blue-300 p-2 rounded-md' onClick={stopDetection}>Stop Detection</button>
      ) : (
        <button className="bg-blue-300 p-2 rounded-md" onClick={startDetection}>Start Detection</button>
      )}</div>

      <div className='text-center py-2'><h1>Human Count : {personData.length}</h1>
      <h1>Other object that is detected : </h1>
      {detectData && (detectData.map((obj, index) => 
     <h3>{index +1}. {obj.class} { Math.floor(obj.score * 100).toString()}%</h3>
     ))}</div>
      
    </div>
  );
}

export default App;
