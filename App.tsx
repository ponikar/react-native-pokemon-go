import {
  useClockValue,
  Circle,
  useComputedValue,
  useImage,
  useTouchHandler,
  useValue,
  interpolate,
  Extrapolate,
  Image,
  Canvas,
  runTiming,
  runSpring,
} from "@shopify/react-native-skia";
import { Dimensions, View } from "react-native";

import Touchable from "react-native-skia-gesture";

const dimens = Dimensions.get("screen");

const center = {
  x: dimens.width / 2,
  y: dimens.height / 2,
};

const [upperLimit, lowerLimit] = [center.y - 75, center.y + 100];

const limits = {
  top: center.x - 50,
  bottom: center.y + 50,
};
const Demo = () => {
  const clock = useClockValue();

  const image = useImage(require("./assets/ball.png"));
  const background = useImage(require("./assets/background.jpg"));
  const pikachu = useImage(require("./assets/pika.png"));

  const isDragging = useValue(false);
  const ballY = useValue(0);
  const ballX = useValue(center.x - 100);
  const scale = useValue(200);

  useComputedValue(() => {
    if (isDragging.current) {
      return ballY;
    }
    const period = (limits.bottom - limits.top) * 2;

    const scaledValue = Math.cos((clock.current / period) * 1 * Math.PI);

    const oscillatingX = center.y + scaledValue * (limits.bottom - center.y);
    ballY.current = oscillatingX;
    return oscillatingX;
  }, [clock, isDragging]);

  const pikaMovement = useComputedValue(() => {
    const limits = {
      left: center.x - 100,
      right: center.x + 200,
    };

    const period = (limits.left - limits.right) * 2;
    const scaledValue = Math.sin((clock.current / period) * 0.3 * Math.PI);

    const oscillatingX = limits.left + scaledValue * (limits.right - center.y);

    return oscillatingX;
  }, [clock]);

  const onTouch = useTouchHandler({
    onStart: (e) => {
      console.log("ON START");
      isDragging.current = true;
    },
    onActive: (e) => {
      ballY.current += e.velocityY * 0.01;
      ballX.current += e.velocityX * 0.01;
    },
    onEnd: (e) => {
      if (ballY.current < upperLimit + 50) {
        runTiming(ballY, 150, {
          duration: 250,
        });

        const diff = Math.abs(center.x - ballX.current);

        let animatedValue = ballX.current;

        console.log("DIFF", diff);
        // for straight direction
        if (!(diff < 100 && diff > 70)) {
          const percentage = ((diff + 75) * 100) / center.x;
          animatedValue = ballX.current * percentage;

          animatedValue *= center.x - 75 > ballX.current ? -0.005 : 0.05;
        } else {
          console.log("GOING STRAIGHT");
        }

        runTiming(ballX, animatedValue, {
          duration: 1000,
        });

        runTiming(scale, 2, {
          duration: 600,
        });
      } else {
      }
    },
  });

  return (
    <Canvas
      style={{
        flex: 1,
      }}
      onTouch={onTouch}
    >
      <Image
        width={dimens.width}
        fit="cover"
        height={dimens.height}
        image={background}
      />

      <Image
        width={200}
        height={200}
        image={pikachu}
        x={pikaMovement}
        y={200}
        fit="contain"
      />

      <Image
        width={scale}
        height={scale}
        image={image}
        x={ballX}
        y={ballY}
        fit="cover"
      />
    </Canvas>
  );
};

export default Demo;
