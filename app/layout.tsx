import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "./globals.css";
import "./liquid.css";
import {Header,Footer} from "@/components/header";
export const metadata={title:{default:"Nijengee — Votre projet, les bons experts.",template:"%s · Nijengee"},description:"Trouvez les bons professionnels de la construction pour votre projet à Kinshasa."};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="fr" data-scroll-behavior="smooth"><body><a className="skip" href="#contenu">Aller au contenu</a><Header/><main id="contenu">{children}</main><Footer/></body></html>}
