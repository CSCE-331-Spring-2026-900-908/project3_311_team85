import { useState, useRef } from 'react';
import './SpinningWheel.css';

const WHEEL_SEGMENTS = [
  { text: '10% OFF', color: '#FF6B6B', type: 'percentage', value: 0.10 },
  { text: 'FREE TOPPING', color: '#4ECDC4', type: 'free_topping' },
  { text: '5% OFF', color: '#45B7D1', type: 'percentage', value: 0.05 },
  { text: 'TRY AGAIN', color: '#96CEB4', type: 'nothing' },
  { text: '$1 OFF', color: '#FFEAA7', type: 'fixed', value: 1.00 },
  { text: 'FREE UPGRADE', color: '#DDA0DD', type: 'free_upgrade' },
  { text: '15% OFF', color: '#98D8C8', type: 'percentage', value: 0.15 },
  { text: 'BOBA BONUS', color: '#FFB6C1', type: 'boba_bonus' }
];

export default function SpinningWheel({ onSpinComplete, hasSpunToday }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const wheelRef = useRef(null);

  const getSegmentAtPointer = (finalRotation) => {
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    // The pointer is at the top of the wheel (12 o'clock).
    // SVG draws segment 0 starting at 3 o'clock (0°), so 12 o'clock = 270° in SVG space.
    // When the wheel has rotated by `finalRotation` degrees, we need to find which
    // segment has been carried to the 270° position.
    // We reverse the rotation to find what SVG angle is now at the top:
    //   svgAngleAtPointer = (270 - finalRotation + 360*n) mod 360
    // Then find which segment index owns that angle:
    //   index = floor(svgAngleAtPointer / segmentAngle)
    const svgAngleAtPointer = ((270 - finalRotation) % 360 + 360) % 360;
    const index = Math.floor(svgAngleAtPointer / segmentAngle);
    return WHEEL_SEGMENTS[index];
  };

  const spinWheel = () => {
    if (isSpinning || hasSpunToday) return;

    setIsSpinning(true);
    setSelectedSegment(null);

    const segmentAngle = 360 / WHEEL_SEGMENTS.length;

    // Pick a random winning segment index
    const winningIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);

    // Calculate the exact SVG angle we need at the pointer (270°) for this segment.
    // Each segment spans [index * segmentAngle, (index+1) * segmentAngle).
    // Place the center of the winning segment at 270°:
    const winningSegmentCenter = winningIndex * segmentAngle + segmentAngle / 2;
    // How much do we rotate the wheel so that angle ends up at 270°?
    // finalRotation ≡ 270 - winningSegmentCenter  (mod 360)
    const targetRest = ((270 - winningSegmentCenter) % 360 + 360) % 360;

    // Spin at least 5 full rotations for visual effect, landing on targetRest
    const currentRest = ((rotation % 360) + 360) % 360;
    const delta = (targetRest - currentRest + 360) % 360;
    const totalRotation = rotation + 5 * 360 + delta;

    setRotation(totalRotation);

    // After the animation, read the winner back from the final angle
    // so the displayed prize always matches where the pointer actually landed.
    setTimeout(() => {
      const winner = getSegmentAtPointer(totalRotation);
      console.log('Winner at pointer:', winner.text);
      setSelectedSegment(winner);
      setIsSpinning(false);
      onSpinComplete(winner);
    }, 4050);
  };

  const createWheelSegments = () => {
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;

    return WHEEL_SEGMENTS.map((segment, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = (index + 1) * segmentAngle;

      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      const largeArcFlag = segmentAngle > 180 ? 1 : 0;

      const x1 = 200 + 180 * Math.cos(startAngleRad);
      const y1 = 200 + 180 * Math.sin(startAngleRad);
      const x2 = 200 + 180 * Math.cos(endAngleRad);
      const y2 = 200 + 180 * Math.sin(endAngleRad);

      const pathData = [
        `M 200 200`,
        `L ${x1} ${y1}`,
        `A 180 180 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      const textAngle = startAngle + segmentAngle / 2;
      const textAngleRad = (textAngle * Math.PI) / 180;
      const textX = 200 + 120 * Math.cos(textAngleRad);
      const textY = 200 + 120 * Math.sin(textAngleRad);

      return (
        <g key={index}>
          <path
            d={pathData}
            fill={segment.color}
            stroke="#fff"
            strokeWidth="2"
          />
          <text
            x={textX}
            y={textY}
            fill="#fff"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${textAngle}, ${textX}, ${textY})`}
          >
            {segment.text}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="spinning-wheel-container">
      <div className="wheel-wrapper">
        <svg
          ref={wheelRef}
          width="400"
          height="400"
          className="wheel"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
          }}
        >
          {createWheelSegments()}
          <circle cx="200" cy="200" r="30" fill="#fff" stroke="#333" strokeWidth="2" />
        </svg>

        <div className="wheel-pointer">
          <div className="pointer-triangle"></div>
        </div>
      </div>

      <button
        onClick={spinWheel}
        disabled={isSpinning || hasSpunToday}
        className="spin-button"
      >
        {hasSpunToday ? 'Come Back Tomorrow!' : isSpinning ? 'Spinning...' : 'SPIN THE WHEEL!'}
      </button>

      {selectedSegment && (
        <div className="result-display">
          <h3>You Won!</h3>
          <div className="prize-info" style={{ backgroundColor: selectedSegment.color }}>
            {selectedSegment.text}
          </div>
        </div>
      )}
    </div>
  );
}