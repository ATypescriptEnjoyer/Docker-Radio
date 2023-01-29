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
  Spacer,
  TextContainer,
  GetInTouch,
  DataChild,
} from './App.styled';
import {
  PlayArrowOutlined,
  PauseOutlined,
  VolumeDownOutlined,
  VolumeOffOutlined,
  HeadphonesOutlined,
  LibraryMusicOutlined,
} from '@mui/icons-material';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { ThemeProvider } from '@mui/material';
import { AppConfig, createTheme } from "@mui/material/styles"
import {Helmet} from "react-helmet";


export const App = (): JSX.Element => {
  const [socket, setSocket] = useState<Socket>();
  const [tracks, setTracks] = useState(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const [streamUrl, setStreamUrl] = useState<string>('/stream');
  const [volume, setVolume] = useState<number>(parseFloat(localStorage.getItem('volume') || '0.15'));
  const playerRef = useRef<HTMLAudioElement>(null);
  const [listeners, setListeners] = useState(0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState({
    artist: '',
    title: '',
  });
  const [config, setConfig] = useState<AppConfig>({
    accentColor: "",
    backgroundColor: "",
    contact: "",
    header: "",
    subtitle: "",
    title: ""
  });

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume = volume;
      if (!playerRef.current.canPlayType || playerRef.current.canPlayType('audio/ogg') === '') {
        setStreamUrl('/backup_stream');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerRef]);

  useEffect(() => {
    const getConfig = async (): Promise<void> => {
      const url = `/config.json`;
      const { data } = await axios.get<AppConfig>(url);
      setConfig(data);
    };
    getConfig();
  }, []);

  useEffect(() => {
    const getTrackCount = async (): Promise<void> => {
      const url = `/trackcount`;
      const { data } = await axios.get<number>(url);
      setTracks(data);
    };
    getTrackCount();
  }, []);

  useEffect(() => {
    const socketUrl = `ws${window.location.protocol === "https:" ? "s" : ""}://${window.location.host}/`;
    const socket = io(socketUrl, {
      reconnectionDelayMax: 10000,
      reconnection: true,
      reconnectionAttempts: 10,
      path: '/socket',
    });
    setSocket(socket);
    socket.on('connect', () => {
      socket.emit('LISTEN_STATE_CHANGED', playing);
    });
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
          album: config?.header,
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
  }, [playing, config?.header]);

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

  const handleAudioError = (): void => {
    if (playerRef.current && playing) {
      playerRef.current.src = '';
      playerRef.current.src = streamUrl;
      playerRef.current.play();
    }
  };

  return (
    <ThemeProvider theme={createTheme({config})}>
      <AppComponent>
        <Helmet>
          <title>{config.title}</title>
          <meta name="description" content={config.subtitle} />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color={config.accentColor} />
          <meta name="msapplication-TileColor" content={config.accentColor} />
          <meta name="theme-color" content={config.accentColor} />
        </Helmet>
        <audio ref={playerRef} onError={handleAudioError} />
        <Background autoPlay muted loop src="bg.mp4" />
        <Container>
          <TextContainer>
            <Title>{config?.header}</Title>
            <Subtitle>{config?.subtitle}</Subtitle>
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
              <DataChild flex="initial" title={`${listeners} listening now!`}>
                <HeadphonesOutlined /> {listeners}
              </DataChild>
              <Spacer>/ /</Spacer>
              <DataChild title={`${tracks} tracks loaded!`}>
                <LibraryMusicOutlined />
                {tracks}
              </DataChild>
              <Spacer>/ /</Spacer>
              <DataChild flex={0.5} title={`Version ${process.env.REACT_APP_VERSION}`}>
                {process.env.REACT_APP_VERSION}
              </DataChild>
            </DataContainer>
          </MediaContainer>
        </Container>
        {config?.contact && <GetInTouch>{config?.contact}</GetInTouch>}
      </AppComponent>
    </ThemeProvider>
  );
};
