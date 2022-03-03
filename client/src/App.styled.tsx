import React from 'react';
import { Slider } from '@mui/material';
import styled from 'styled-components';

export const App = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 600px) {
    align-items: flex-start;
  }
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

export const TextContainer = styled.div`
  @media (max-width: 600px) {
    margin-top: 24px;
    flex: 1;
  }
`;

export const Container = styled.div`
  display: flex;
  height: 40%;
  width: 80%;
  flex-direction: column;

  @media (max-width: 600px) {
    height: 60%;
  }
`;

export const Title = styled.h1`
  color: white;
  font-size: 70px;
  padding: 0;
  margin: 0;

  @media (max-width: 600px) {
    font-size: 40px;
  }
`;

export const Subtitle = styled.h2`
  padding: 0;
  margin: 0 0 32px 0;
  color: white;
  font-size: 30px;
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
  align-self: center;
  grid-column-start: 1;
  grid-row-start: 1;
  cursor: pointer;

  &:hover {
    color: #32cd32;
  }

  &:active {
    border-style: outset;
  }

  svg {
    font-size: 40px;
  }

  @media (max-width: 600px) {
    grid-row-start: 2;
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
  grid-column-start: 2;

  @media (max-width: 600px) {
    flex-direction: column;
    height: auto;
    padding: 16px;
    grid-column: span 2;
  }
`;

export const MediaContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: max-content auto;
  grid-column-gap: 24px;
  grid-row-gap: 12px;
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
  text-transform: uppercase;
`;

export const SongArtist = styled.p`
  font-size: 20px;
  color: white;
  margin: 0;
  padding: 0;
  text-transform: uppercase;
`;

export const VolumeBox = styled.div`
  color: white;
  display: flex;
  width: 200px;
  gap: 20px;
  align-items: center;
  padding-right: 20px;
  box-sizing: border-box;

  @supports (-webkit-touch-callout: none) {
    display: none;
  }
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

export const Listeners = styled.span`
  color: #32cd32;
  font-size: 16px;
  grid-column-start: 2;
  grid-row-start: 2;

  @media (max-width: 600px) {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1d1f2b;
  }
`;
