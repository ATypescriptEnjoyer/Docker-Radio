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
  DataContainer,
  DataContainerChild,
  TextContainer,
  GetInTouch,
} from './App.styled';
import {
  PlayArrowOutlined,
  PauseOutlined,
  VolumeDownOutlined,
  VolumeOffOutlined,
  HeadphonesOutlined,
} from '@mui/icons-material';
import { io, Socket } from 'socket.io-client';

export const App = (): JSX.Element => {
  const [socket, setSocket] = useState<Socket>();
  const [playing, setPlaying] = useState<boolean>(false);
  const [streamUrl, setStreamUrl] = useState<string>(process.env.REACT_APP_STREAM_URL || '');
  const [volume, setVolume] = useState<number>(parseFloat(localStorage.getItem('volume') || '0.15'));
  const playerRef = useRef<HTMLAudioElement>(null);
  const [listeners, setListeners] = useState(0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState({
    artist: '',
    title: '',
  });

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume = volume;
      if (!playerRef.current.canPlayType || playerRef.current.canPlayType('audio/ogg') === '') {
        setStreamUrl(process.env.REACT_APP_BACKUP_STREAM_URL || '');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerRef]);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_IO_CONNECTION || '', {
      reconnectionDelayMax: 10000,
      path: '/socket',
    });
    setSocket(socket);
    socket.on('LISTENER_COUNT', (data) => {
      setListeners(data);
    });
    socket.on('TRACK_CHANGED', ({ artist, title }: { artist: string; title: string }) => {
      if (artist === '' || title === '') return; //dont set empty tracks
      setCurrentlyPlaying({
        artist,
        title,
      });
      if (navigator.mediaSession) {
        navigator.mediaSession.metadata = new MediaMetadata({
          artist,
          title,
          album: process.env.REACT_APP_WEB_HEADER,
          artwork: [
            {
              src: '/artwork.png',
              type: 'image/png',
              sizes: '236x236',
            },
          ],
        });
      }
    });
    return () => {
      socket.off('LISTENER_COUNT');
      socket.off('TRACK_CHANGED');
      socket.disconnect();
      setSocket(undefined);
    };
  }, []);

  const handleMediaButtonClick = async (): Promise<void> => {
    if (!playerRef.current) return;
    if (playing) {
      playerRef.current.pause();
      playerRef.current.src = ''; //prevent actual pausing or it starts to desync
    } else {
      playerRef.current.src = streamUrl;
      playerRef.current.play();
    }
    if (socket) {
      socket.emit('LISTEN_STATE_CHANGED', !playing);
    }
    setPlaying(!playing);
  };

  const handleVolumeChanged = (newVolume: number): void => {
    localStorage.setItem('volume', newVolume.toString());
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.volume = newVolume;
    }
  };

  return (
    <AppComponent>
      <audio ref={playerRef} />
      <Background autoPlay muted loop src="bg.mp4" />
      <Container>
        <TextContainer>
          <Title>{process.env.REACT_APP_WEB_HEADER}</Title>
          <Subtitle>{process.env.REACT_APP_WEB_SUBTITLE}</Subtitle>
        </TextContainer>
        <MediaContainer>
          <MediaButton onClick={handleMediaButtonClick}>
            {playing ? <PauseOutlined /> : <PlayArrowOutlined />}
          </MediaButton>
          <MediaInfoBox>
            <SongDetails>
              <SongTitle replaceSpeed={50}>{currentlyPlaying.title}</SongTitle>
              <SongArtist replaceSpeed={50}>{currentlyPlaying.artist}</SongArtist>
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
          <DataContainer>
            <DataContainerChild>
              <HeadphonesOutlined />
              {listeners}
            </DataContainerChild>
            <DataContainerChild>{process.env.REACT_APP_VERSION}</DataContainerChild>
          </DataContainer>
        </MediaContainer>
      </Container>
      {process.env.REACT_APP_CONTACT && <GetInTouch>{process.env.REACT_APP_CONTACT}</GetInTouch>}
    </AppComponent>
  );
};
