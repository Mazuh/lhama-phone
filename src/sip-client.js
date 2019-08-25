// import 'webrtc-adapter';
// import QualityOfService from './QualityOfService';
import { UA } from 'sip.js';

export const FR_POINTS_OF_PRESENCE_DOMAINS = {
  'us-east-nj': [
    'wr-us-east-nj-01.webrtc.flowroute.com',
    'wr-us-east-va-01.webrtc.flowroute.com',
  ],
  'us-west-or': [
    'wr-us-west-or-01.webrtc.flowroute.com',
    'wr-us-west-sjc-01.webrtc.flowroute.com',
  ],
  'us-east-va': [
    'wr-us-east-va-01.webrtc.flowroute.com',
    'wr-us-east-nj-01.webrtc.flowroute.com',
  ],
  'us-west-sjc': [
    'wr-us-west-sjc-01.webrtc.flowroute.com',
    'wr-us-west-or-01.webrtc.flowroute.com',
  ],
  'eu-west-ldn': [
    'wr-eu-west-ldn-01.webrtc.flowroute.com',
    'wr-eu-west-ams-01.webrtc.flowroute.com',
  ],
  'eu-west-ams': [
    'wr-eu-west-ams-01.webrtc.flowroute.com',
    'wr-eu-west-ldn-01.webrtc.flowroute.com',
  ],
};

/**
 * Flowroute SIP over WebSocket and WebRTC JavaScript client.
 *
 * This class is a facade for WebRTC, DOM and SIP.js APIs,
 * so it'll return many of its types and dispatch many of
 * its events, with some changes to ease Flowroute apps work.
 *
 * @see https://sipjs.com/api/0.15.0/
 * @see https://github.com/onsip/SIP.js/blob/0.15.4/docs/api/sip.js.md
 */
export default class SIPClient {
  /**
   * Init a SIP.js user agent with some default values and set its callbacks.
   *
   * @param {object?}   params
   * @param {string?}   params.pointOfPresence one of `FR_POINTS_OF_PRESENCE_DOMAINS` keys
   * @param {string?}   params.webSocket alternative server URL (do not use this along with `pointOfPresence`)
   * @param {string?}   params.callerId caller ID for building user agent URI
   * @param {string?}   params.callerDomain caller domain for building user agent URI
   * @param {string?}   params.displayName to be used on calls params
   * @param {string?}   params.password to be used on calls params
   * @param {array?}    params.extraHeaders to an array of string passed on the call
   * @param {function?} params.onUserAgentAction general callback for UA events and its payloads
   * @param {number?}   params.intervalOfQualityReport in milliseconds
   */
  constructor(params = {}) {
    this.params = {
      pointOfPresence: params.pointOfPresence || undefined,
      webSocket: undefined,
      callerId: 'anonymous',
      callerDomain: 'wss.flowroute.com',
      displayName: 'Flowroute Client Demo',
      password: 'nopassword',
      extraHeaders: [],
      intervalOfQualityReport: undefined,
      onUserAgentAction: () => {},
      ...params,
    };

    if (this.params.pointOfPresence) {
      if (this.params.webSocket) {
        throw new Error('Do not mix webSocket and pointOfPresence params, pick only one of them.');
      }

      if (!FR_POINTS_OF_PRESENCE_DOMAINS[this.params.pointOfPresence]) {
        throw new Error('Invalid point of presence');
      }
    }

    this.isMicMuted = false;
    this.outputVolume = 1;
    this.isRegistered = false;
    this.onCallAction = () => {};
    this.onUserAgentAction = this.params.onUserAgentAction;

    const wsServers = this.params.pointOfPresence ? [
      {
        wsUri: `wss://${FR_POINTS_OF_PRESENCE_DOMAINS[this.params.pointOfPresence][0]}:4443`,
        weight: 20,
      },
      {
        wsUri: `wss://${FR_POINTS_OF_PRESENCE_DOMAINS[this.params.pointOfPresence][1]}:4443`,
        weight: 10,
      },
    ] : this.params.webSocket;
    this.setAudioPlayerElement();
    this.sipUserAgent = new UA({
      uri: `sip:${this.params.callerId}@${this.params.callerDomain}`,
      transportOptions: { wsServers },
      authorizationUser: this.displayName,
      password: this.params.password,
      autostart: false,
    });

    this.sipUserAgent.on('registered', (payload) => {
      this.isRegistered = true;
      this.onUserAgentAction({ type: 'registered', payload });
    });

    [
      'unregistered',
      'registrationFailed',
    ].forEach((eventType) => {
      this.sipUserAgent.on(eventType, (payload) => {
        this.onUserAgentAction({ type: eventType, payload });
      });
    });

    [
      'connecting',
      'connected',
      'disconnected',
      'transportError',
      'message',
      'messageSent',
    ].forEach((eventType) => {
      this.sipUserAgent.transport.on(eventType, (payload) => {
        this.onUserAgentAction({ type: eventType, payload });
      });
    });
  }

  /**
   * Connect to the signaling server and register user agent.
   */
  run() {;
    this.sipUserAgent.start();
  }

  /**
   * Disconnect from signaling server.
   *
   * @param {object?}  params
   * @param {boolean?} params.eraseUserAgentCallbacks;
   */
  stop(params = {}) {
    if (params.eraseUserAgentCallbacks) {
      this.onUserAgentAction({ type: 'disconnected' });
      this.onUserAgentAction = () => {};
    }

    this.sipUserAgent.transport.disconnect().then(() => {
      this.sipUserAgent.stop();
      this.onUserAgentAction({ type: 'disconnected' });
    });
  }

  /**
   * Set to what number this client will call.
   * (You may pass this by `call` method args too.)
   *
   * @param {string} did
   */
  setDID(did) {
    if (typeof did !== 'string') {
      throw new Error('Expected DID to be a string');
    } else if (did.length !== 11) {
      throw new Error('Currently only DIDs with 11 length are supported');
    }

    this.params = { ...this.params, did };
  }

  /**
   * Make a call.
   * Also initialize any necessary DOM node for audio output.
   * Created call will be available by `getActiveCall` getter method.
   *
   * @param {object?}        options
   * @param {string?}        options.to number destiny
   * @param {function?}      options.onCallAction callback for call events and its payloads
   * @param {object|string?} options.audioConstraints callback for call events and its payloads
   */
  call(options = {}) {
    if (!this.isRegistered) {
      throw new Error('User agent not registered yet');
    }

    if (this.activeCall) {
      throw new Error('Already has active call');
    }

    const {
      to,
      onCallAction = () => {},
    } = options;

    const did = to || this.params.did;
    if (did) {
      this.setDID(did);
    } else {
      throw new Error('No DID provided');
    }

    this.onCallAction = onCallAction;

    const session = this.sipUserAgent.invite(`sip:${did}@sip.flowroute.com`, {
      sessionDescriptionHandlerOptions: {
        constraints: { audio: options.audioConstraints || true, video: false },
      },
    });

    [
      'progress',
      'accepted',
      'rejected',
      'failed',
      'terminated',
      'cancel',
      'reinvite',
      'referRequested',
      'replaced',
      'dtmf',
      'bye',
    ].forEach((eventType) => {
      session.on(eventType, (payload) => {
        this.onCallAction({ type: eventType, payload });
      });
    });

    session.on('trackAdded', () => {
      this.connectAudio(session);
    });

    session.on('terminated', () => {
      this.disconnectAudio();
      this.activeCall = null;
    });

    this.activeCall = session;
  }

  /**
   * Getter of active call, i.e., a proxy for current RTC SIP.js session.
   *
   * If a call attempt was made but no "newRTCSession" user agent event
   * was dispatched, then this should be `{}`, which is still a truthy JS object
   * but with no available RTC methods to proxy. And while no call is made or the
   * previous one was already hung up or failed, this should be the falsy `null`.
   *
   * When desired to hangup the session call, use `hangup` client method
   * instead of directly terminating this returned session.
   *
   * @return {Session|object}
   */
  getActiveCall() {
    return this.activeCall;
  }

  /**
   * Hangup current active call and unassign it.
   */
  hangup() {
    if (!this.activeCall) {
      throw new Error('There is no active call to hangup');
    }

    this.activeCall.terminate();
    this.activeCall = null;
  }

  /**
   * Set audio player volume.
   *
   * @param {number|string} value between 0 and 100
   */
  setOutputVolume(value) {
    const volume = parseInt(value, 10) / 100;
    if (volume < 0) {
      this.outputVolume = 0;
    } else if (volume > 1) {
      this.outputVolume = 1;
    } else {
      this.outputVolume = volume;
    }

    if (this.audioPlayerElement) {
      this.audioPlayerElement.volume = this.outputVolume;
    }
  }

  /**
   * Set microphone mute.
   *
   * @param {boolean} isMuted to set microphone to muted
   */
  setMicMuted(isMuted) {
    const { activeCall } = this;
    const connection = activeCall.sessionDescriptionHandler.peerConnection;

    connection.getLocalStreams().forEach((stream) => {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    });
    this.onCallAction({ type: isMuted ? 'muted' : 'unmuted' });
  }

  /**
   * Get audio player volume.
   *
   * @return {number} between 0 and 100
   */
  getOutputVolume() {
    return this.outputVolume * 100;
  }

  /**
   * Add a P-header to client calls.
   *
   * @param {string} name
   * @param {string} value
   */
  pushExtraPrivateCallHeader(name, value) {
    if (!name || !value) {
      throw new Error('Provide name and value for adding P-header');
    }

    this.params.extraHeaders.push(`P-${name}: ${value}`);
  }

  /**
   * Get a reference of P-headers passed by `pushExtraPrivateCallHeader` method.
   *
   * @return {array}
   */
  getExtraCallHeaders() {
    return this.params.extraHeaders;
  }

  /**
   * @private
   */
  setAudioPlayerElement(domNode) {
    if (domNode === undefined) {
      const created = document.createElement('audio');
      this.audioPlayerElement = created;
    } else if (typeof domNode === 'string') {
      const found = document.querySelector(domNode);
      if (!found || found.tagName.toLowerCase() !== 'audio') {
        throw new Error('Invalid DOM selector provided for audio element');
      }

      this.audioPlayerElement = found;
    } else {
      this.audioPlayerElement = domNode;
    }

    this.audioPlayerElement.defaultMuted = false;
    this.audioPlayerElement.autoplay = true;
    this.audioPlayerElement.controls = true;
    this.audioPlayerElement.volume = this.outputVolume;
  }

  /**
   * @private
   */
  connectAudio(session) {
    const connection = session.sessionDescriptionHandler.peerConnection; 
    const receivers = connection.getReceivers();
    if (!receivers.length) {
      return;
    }

    const remoteStream = new MediaStream();
    receivers.forEach((receiver) => {
      remoteStream.addTrack(receiver.track);
    });
    this.audioPlayerElement.srcObject = remoteStream;
    this.setMicMuted(this.isMicMuted);
  }

  /**
   * @private
   */
  disconnectAudio() {
    if (!this.audioPlayerElement || !this.audioPlayerElement.srcObject) {
      return;
    }

    this.audioPlayerElement.srcObject.getTracks().forEach(track => track.stop());
    this.audioPlayerElement.srcObject = null;
  }
}

window.SIPClient = SIPClient;
