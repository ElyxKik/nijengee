import type {SVGProps} from "react";
/** Shared monogram. The viewBox removes the generation's empty margins without changing the source asset. */
export function BrandMark({variant="forest",...props}:SVGProps<SVGSVGElement>&{variant?:"forest"|"white"}){
 return <svg viewBox="200 285 855 720" width="32" height="32" aria-hidden="true" focusable="false" {...props}><image href={variant==="white"?"/brand/nijengee-n-logo-white.svg":"/brand/nijengee-n-logo.png"} x="0" y="0" width="1254" height="1254"/></svg>;
}
