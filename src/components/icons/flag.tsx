import { memo, useId } from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

export type CountryCode = 'JM' | 'TT' | 'GM' | 'GH';

export const COUNTRY_NAMES: Record<CountryCode, string> = {
  JM: 'Jamaica',
  TT: 'Trinidad and Tobago',
  GM: 'The Gambia',
  GH: 'Ghana',
};

function star(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.382;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
}

/** Hand-drawn SVG flags for the S2S destinations, on a 36×24 grid. */
export const Flag = memo(function Flag({
  code,
  size = 28,
  shape = 'rounded',
}: {
  code: CountryCode;
  size?: number;
  shape?: 'rounded' | 'circle';
}) {
  const id = useId().replace(/:/g, '');
  const circle = shape === 'circle';
  const w = circle ? size : size * 1.5;
  const h = size;
  return (
    <Svg width={w} height={h} viewBox={circle ? '6 0 24 24' : '0 0 36 24'} accessibilityLabel={COUNTRY_NAMES[code]}>
      <Defs>
        <ClipPath id={id}>
          {circle ? <Rect x={6} y={0} width={24} height={24} rx={12} /> : <Rect width={36} height={24} rx={5} />}
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${id})`}>
        {code === 'JM' && (
          <>
            <Rect width={36} height={24} fill="#009B3A" />
            <Path d="M0 0 L15 12 L0 24 Z M36 0 L21 12 L36 24 Z" fill="#111111" />
            <Path d="M0 0 L36 24 M36 0 L0 24" stroke="#FED100" strokeWidth={3.6} />
          </>
        )}
        {code === 'TT' && (
          <>
            <Rect width={36} height={24} fill="#CE1126" />
            <Path d="M0 0 L36 24" stroke="#FFFFFF" strokeWidth={11} />
            <Path d="M0 0 L36 24" stroke="#111111" strokeWidth={7.5} />
          </>
        )}
        {code === 'GM' && (
          <>
            <Rect width={36} height={9} fill="#CE1126" />
            <Rect y={9} width={36} height={6} fill="#FFFFFF" />
            <Rect y={10} width={36} height={4} fill="#0C1C8C" />
            <Rect y={15} width={36} height={9} fill="#3A7728" />
          </>
        )}
        {code === 'GH' && (
          <>
            <Rect width={36} height={8} fill="#CE1126" />
            <Rect y={8} width={36} height={8} fill="#FCD116" />
            <Rect y={16} width={36} height={8} fill="#006B3F" />
            <Path d={star(18, 12.3, 4.3)} fill="#111111" />
          </>
        )}
        {circle ? (
          <Rect x={6.25} y={0.25} width={23.5} height={23.5} rx={11.75} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth={0.5} />
        ) : (
          <Rect x={0.25} y={0.25} width={35.5} height={23.5} rx={4.75} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth={0.5} />
        )}
      </G>
    </Svg>
  );
});
