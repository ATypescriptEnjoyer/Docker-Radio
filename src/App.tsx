import React, { useState } from 'react';
import {
  Background,
  Title,
  App as AppComponent,
  Container,
  MediaButton,
  MediaContainer,
  MediaInfoBox,
  SongTitle,
  SongArtist,
  SongDetails,
  VolumeSlider,
  VolumeBox,
} from './App.styled';
import { PlayArrowOutlined, PauseOutlined, VolumeDownOutlined } from '@mui/icons-material';

export const App = (): JSX.Element => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(50);

  const handleMediaButtonClick = (): void => {
    setPlaying(!playing);
  };

  const handleVolumeChanged = (newVolume: number): void => {
    setVolume(newVolume);
  };

  return (
    <AppComponent>
      <Background autoPlay muted loop src="bg.mp4" />
      <Container>
        <Title>Phonk.Live</Title>
        <MediaContainer>
          <MediaButton onClick={handleMediaButtonClick}>
            {!playing ? <PauseOutlined /> : <PlayArrowOutlined />}
          </MediaButton>
          <MediaInfoBox>
            <SongDetails>
              <SongTitle>Phonk.Live</SongTitle>
              <SongArtist>Coming Soon...</SongArtist>
            </SongDetails>
            <VolumeBox>
              <VolumeDownOutlined />
              <VolumeSlider
                value={volume}
                min={0}
                max={100}
                onChange={(_event, value): void => handleVolumeChanged(value as number)}
              />
            </VolumeBox>
          </MediaInfoBox>
        </MediaContainer>
      </Container>
    </AppComponent>
  );
};
