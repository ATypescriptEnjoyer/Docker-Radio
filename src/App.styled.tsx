import { Slider } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

export const App = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Background = styled.video`
  width: 100vw;
  height: 100vh;
  position: absolute;
  z-index: -99;
  left: 0;
  top: 0;
  object-fit: cover;
  filter: brightness(10%);
`;

export const Container = styled.div`
  display: flex;
  height: 40%;
  width: 80%;
  flex-direction: column;
`;

export const Title = styled.h1`
  color: white;
  font-size: 70px;
`;

export const Subtitle = styled.h2`
  color: white;
  font-size: 50px;
`;

export const MediaButton = styled.button`
  width: 64px;
  height: 64px;
  background-color: #1d1f2b;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all linear 0.25s;

  &:hover {
    color: #32cd32;
  }

  &:active {
    border-style: outset;
  }

  svg {
    font-size: 40px;
  }
`;

export const MediaInfoBox = styled.div`
  height: 64px;
  max-width: 800px;
  width: 100%;
  background-color: #1d1f2b;
  display: flex;
  padding-left: 16px;
  box-sizing: border-box;
`;

export const MediaContainer = styled.div`
  display: flex;
  gap: 24px;
`;

export const SongDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  flex: 1;
`;

export const SongTitle = styled.p`
  font-size: 20px;
  color: #32cd32;
  margin: 0;
  padding: 0;
`;

export const SongArtist = styled.p`
  font-size: 20px;
  color: white;
  margin: 0;
  padding: 0;
`;

export const VolumeBox = styled.div`
  color: white;
  display: flex;
  width: 200px;
  gap: 20px;
  align-items: center;
  padding-right: 20px;
  box-sizing: border-box;
`;

export const VolumeSlider = styled(Slider)`
  max-width: 150px;

  && {
    color: #32cd32;

    span:first-child {
      color: white;
    }

    .MuiSlider-thumb {
      box-shadow: none;
    }
  }
`;
