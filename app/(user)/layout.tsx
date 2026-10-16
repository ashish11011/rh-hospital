import Footer from "@/components/Footer";
import Header from "@/components/header";
import { Navbar } from "@/components/navbar";
import React from "react";
import PostHogClient from "./posthogClient";
import Script from "next/script";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <Navbar />
      <div>{children}</div>
      <Footer />

      {/* Meta Pixel Code */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
            !function(f,b,e,v,n,t,s) {
              if(f.fbq)return;
              n=f.fbq=function(){
                n.callMethod
                  ? n.callMethod.apply(n,arguments)
                  : n.queue.push(arguments)
              };
              if(!f._fbq)f._fbq=n;
              n.push=n;
              n.loaded=!0;
              n.version='2.0';
              n.queue=[];
              t=b.createElement(e);
              t.async=!0;
              t.src=v;
              s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)
            }(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js'
            );

            fbq('init', '28058553173783884');
            fbq('track', 'PageView');
          `}
      </Script>

      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=28058553173783884&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
    </>
  );
};

export default Layout;
