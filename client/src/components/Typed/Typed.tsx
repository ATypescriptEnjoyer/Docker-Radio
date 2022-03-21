import React, { useState, useEffect } from 'react';

interface Props {
  className?: string;
  replaceSpeed: number;
  children: string;
}

const Typed = (props: Props): JSX.Element => {
  const [text, setText] = useState('');

  useEffect(() => {
    setTextToEmpty().then(() => setTextToNew(props.children));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.children]);

  const setTextToEmpty = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        let decrement = text.length;
        const interval = setInterval(() => {
          if (decrement === 0) {
            console.log('Cleared');
            clearInterval(interval);
            resolve();
          }
          setText((currText) => currText.slice(0, decrement - 1));
          decrement--;
        }, props.replaceSpeed);
      } catch (error) {
        reject(error);
      }
    });
  };

  const setTextToNew = async (newText: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        let increment = 0;
        const interval = setInterval(() => {
          setText(newText.slice(0, increment + 1));
          increment++;
          if (increment - 1 === newText.length) {
            console.log('Built');
            clearInterval(interval);
            resolve();
          }
        }, props.replaceSpeed);
      } catch (error) {
        reject(error);
      }
    });
  };

  return <p className={props.className}>{text}</p>;
};

export { Typed };
