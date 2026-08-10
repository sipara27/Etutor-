import React, { useState } from "react";
// import { useStore } from "react-redux";
import Toast from "./Toast";

// import { removeToast } from "../../actions/toasts";

const Toasts = () => {
  // const store = useStore();
  // const { removeToast } = props.actions;
  const [toasts, setToasts] = useState<{msg: string, duration: number}[]>([])
  // const states = store.getState()
  // store.subscribe(() => {
  //   setToasts()
  // })

  return (
    <ul className="fixed right-1/2 translate-x-1/2 bottom-5 z-50">
      {toasts.map((toast: any) => {
        const { id } = toast;
        return (
          <Toast {...toast} key={id} />
        );
      })}
    </ul>
  );
};

export default Toasts;