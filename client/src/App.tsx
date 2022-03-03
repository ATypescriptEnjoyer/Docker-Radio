import React, { useEffect, useRef, useState } from 'react';
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
  Subtitle,
  InfoContainer,
  Listeners,
} from './App.styled';
import { PlayArrowOutlined, PauseOutlined, VolumeDownOutlined, VolumeOffOutlined } from '@mui/icons-material';
import { io } from 'socket.io-client';

export const App = (): JSX.Element => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [streamUrl, setStreamUrl] = useState<string>(process.env.REACT_APP_STREAM_URL || '');
  const [volume, setVolume] = useState<number>(0.15);
  const playerRef = useRef<HTMLAudioElement>(null);
  const [listeners, setListeners] = useState(0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState({
    artist: '',
    title: '',
  });

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume = volume;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerRef]);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_IO_CONNECTION || '', {
      reconnectionDelayMax: 10000,
      path: '/socket',
    });
    socket.on('LISTENER_COUNT', (data) => {
      setListeners(data);
    });
    socket.on('TRACK_CHANGED', ({ artist, title }: { artist: string; title: string }) => {
      setCurrentlyPlaying({
        artist,
        title,
      });
      navigator.mediaSession.metadata = new MediaMetadata({
        artist,
        title,
        album: 'phonk.live',
        artwork: [
          {
            src: 'https://phonk.live/artwork.png',
            type: 'image/png',
            sizes: '236x236',
          },
        ],
      });
    });
    return () => {
      socket.off('LISTENER_COUNT');
      socket.off('TRACK_CHANGED');
      socket.disconnect();
    };
  }, []);

  const handleMediaButtonClick = async (): Promise<void> => {
    if (playing) {
      playerRef?.current?.pause();
    } else {
      try {
        await playerRef.current?.play();
      } catch (error) {
        setStreamUrl(process.env.REACT_APP_BACKUP_STREAM_URL || ''); //switch to legacy mpeg stream
        playerRef.current?.play();
      }
    }
    setPlaying(!playing);
  };

  const handleVolumeChanged = (newVolume: number): void => {
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.volume = newVolume;
    }
  };

  return (
    <AppComponent>
      <audio ref={playerRef} src={streamUrl} />
      <Background autoPlay muted loop src="bg.mp4" />
      <Container>
        <Title>Phonk.Live</Title>
        <Subtitle>24/7 Phonk Radio</Subtitle>
        <MediaContainer>
          <MediaButton onClick={handleMediaButtonClick}>
            {playing ? <PauseOutlined /> : <PlayArrowOutlined />}
          </MediaButton>
          <MediaInfoBox>
            <SongDetails>
              <SongTitle>{currentlyPlaying.title}</SongTitle>
              <SongArtist>{currentlyPlaying.artist}</SongArtist>
            </SongDetails>
            <VolumeBox>
              {volume === 0 ? <VolumeOffOutlined /> : <VolumeDownOutlined />}
              <VolumeSlider
                value={volume}
                min={0}
                max={0.3}
                step={0.01}
                onChange={(_event, value): void => handleVolumeChanged(value as number)}
              />
            </VolumeBox>
          </MediaInfoBox>
        </MediaContainer>
        <InfoContainer>
          <Listeners>{listeners} listening right now</Listeners>
        </InfoContainer>
      </Container>
    </AppComponent>
  );
};
