import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAnimate } from "framer-motion";

export const NavProgress = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (loading) {
      const enterAnimation = async () => {
        await animate(
          scope.current,
          { scaleX: 0.0, opacity: 1 },
          {
            duration: 0,
          }
        );
        await animate(
          scope.current,
          { scaleX: 0.7 },
          { duration: 3, ease: "circOut" }
        );
      };
      enterAnimation()
        .then(() => {
          return;
        })
        .catch(() => {
          return;
        });
    } else {
      const exitAnimation = async () => {
        await animate(
          scope.current,
          { scaleX: 1 },
          { duration: 0.2, ease: "easeInOut" }
        );
        await animate(
          scope.current,
          { opacity: 0 },
          {
            duration: 0.5,
            delay: 0.2,
          }
        );
      };

      exitAnimation()
        .then(() => {
          return;
        })
        .catch(() => {
          return;
        });
    }
  }, [animate, loading, scope]);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setLoading(true);
    };
    const handleRouteChangeComplete = () => {
      setLoading(false);
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router]);

  return (
    <div className="sticky top-0 z-[200] h-1 w-full">
      <div
        ref={scope}
        className="left-0 h-full w-full origin-left bg-highlight-600"
      ></div>
    </div>
  );
};
