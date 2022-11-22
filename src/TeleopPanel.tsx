import { PanelExtensionContext, RenderState, Topic } from "@foxglove/studio";
import { useLayoutEffect, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Gamepad from 'react-gamepad'


var controller_status = "Err. No Xbox controller found";

var currentTopic = "mux/cmd_vel_rocos"
var ptzTopic = "ptz/continuous_move"

var message = {
  linear: {
    x: 0,
    y: 0,
    z: 0,
  },
  angular: {
    x: 0,
    y: 0,
    z: 0,
  },
};

var ptzMessage = {
  header: {
    stamp: {
      sec: 0,
      nsec: 0,
    },
    frame_id: "ptz",
  },
  thumb_stick: {
    layout: {
      dim: [
        {
          label: "x",
          size: 1,
          stride: 1,
        },
        {
          label: "y",
          size: 1,
          stride: 1,
        },
      ],
      data_offset: 0,
    },
    data: [0, 0],
  },
  left_trigger: {
    data: 0,
  },
  right_trigger: {
    data: 0,
  },
  up: {
    data: 0,
  },
  left: {
    data: 0,
  },
  right: {
    data: 0,
  },
  back: {
    data: 0,
  },
  home: {
    data: 0,
  },
  wiper: {
    data: 0,
  },
};

function connectHandler() {
  controller_status = "Xbox controller connected!";
}

function disconnectHandler() {
  controller_status = "Xbox controller disconnected!";
}

function axisChangeHandler(axisName: string, value: number) {
  if (axisName == "LeftStickY") {
    message.linear.x = value;
  } else if (axisName == "LeftStickX") {
    message.angular.z = -1 * value;
  }
  else if (axisName == "RightStickX") {
    ptzMessage.thumb_stick.data[0] = value;
  } 
  else if (axisName == "RightStickY") {
    ptzMessage.thumb_stick.data[1] = -1 * value;
  }
}

function TeleopPanel({ context }: { context: PanelExtensionContext }): JSX.Element {
  const [_topics, setTopics] = useState<readonly Topic[] | undefined>();

  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  useLayoutEffect(() => {
    context.onRender = (renderState: RenderState, done) => {
      setRenderDone(() => done);
      setTopics(renderState.topics);
    };
    context.watch("currentFrame");
    
    context.advertise?.(currentTopic, "geometry_msgs/msg/Twist");
    context.advertise?.(ptzTopic, "interfaces/msg/ThermalCamera");

  }, []);

  // invoke the done callback once the render is complete
  useEffect(() => {
    if (controller_status == "Xbox controller connected!") {
      context.publish?.(currentTopic, message);
      context.publish?.(ptzTopic, ptzMessage);
    }

    renderDone?.();
  }, [renderDone]);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Teleoperation Panel</h1>
      <p>Status: {controller_status}</p>
      <p>Topic:  {currentTopic} </p>
      <div>
          <p>Linear command: {message.linear.x}</p>
          <p>Angular command: {message.angular.z}</p>
          <p>PTZ command: {ptzMessage.thumb_stick.data[0]}, {ptzMessage.thumb_stick.data[1]}</p>
      </div>
      <div className="gamepad">
        <span>
          <Gamepad
            onConnect={connectHandler}
            onDisconnect={disconnectHandler}
            onAxisChange={axisChangeHandler}
          >
            <main>
              <p></p>
            </main>
          </Gamepad>
         
        </span>
      </div>
    </div>
  );
}

export function initTeleopPanel(context: PanelExtensionContext) {
  ReactDOM.render(<TeleopPanel context={context} />, context.panelElement);
}
