import { useEffect, useState } from 'react'
import {
  ADAPTER_EVENTS,
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
  WALLET_ADAPTERS
} from '@web3auth/base'
import { Box, Divider, Grid, Typography } from '@mui/material'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { Web3AuthOptions } from '@web3auth/modal'
import { EthHashInfo } from '@safe-global/safe-react-components'
import Not from './notionalBefore_300x300.png'

import AppBar from './AppBar'
import {
  SafeAuthKit,
  SafeAuthSignInData,
  SafeGetUserInfoResponse,
  Web3AuthModalPack,
  Web3AuthEventListener
} from '../../src/index'

const connectedHandler: Web3AuthEventListener = (data) => console.log('CONNECTED', data)
const disconnectedHandler: Web3AuthEventListener = (data) => console.log('DISCONNECTED', data)

function App() {
  const [safeAuth, setSafeAuth] = useState<SafeAuthKit<Web3AuthModalPack>>()
  const [safeAuthSignInResponse, setSafeAuthSignInResponse] = useState<SafeAuthSignInData | null>(
    null
  )
  const [userInfo, setUserInfo] = useState<SafeGetUserInfoResponse<Web3AuthModalPack>>()
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null)

  useEffect(() => {
    ;(async () => {
      const options: Web3AuthOptions =  {
        clientId:
          'BJx3DIXgC3KJQsHWDsWLvWGnokXojw5PgUXR7EReBrmrf_mHXrmjV4NdGU_n85JqmEDDMt3lBAq6xhpHJRAIeTw',
        web3AuthNetwork: 'testnet',
        authMode: 'WALLET',
        chainConfig: {
          chainNamespace: 'eip155',
          chainId: '0x13881',
          rpcTarget: 'https://polygon-mumbai.g.alchemy.com/v2/cEflTfqtGxaviVhoMHgP4mXqEyENZGPG'
        },
        uiConfig: {
          theme: 'light',
          loginMethodsOrder: ['google', 'twitter', 'facebook']
        }
      }

      const modalConfig = {
        [WALLET_ADAPTERS.TORUS_EVM]: {
          label: 'torus',
          showOnModal: false
        },
        [WALLET_ADAPTERS.METAMASK]: {
          label: 'metamask',
          showOnDesktop: true,
          showOnMobile: false
        }
      }

      const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
          mfaLevel: 'default'
        },
        adapterSettings: {
          uxMode: 'popup',
          whiteLabel: {
            name: 'Safe'
          }
        }
      })

      const web3AuthModalPack = new Web3AuthModalPack(options, [openloginAdapter], modalConfig)

      const safeAuthKit = await SafeAuthKit.init(web3AuthModalPack, {
        txServiceUrl: 'https://safe-transaction-goerli.safe.global'
      })

      safeAuthKit.subscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler)

      safeAuthKit.subscribe(ADAPTER_EVENTS.DISCONNECTED, disconnectedHandler)

      setSafeAuth(safeAuthKit)

      return () => {
        safeAuthKit.unsubscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler)
        safeAuthKit.unsubscribe(ADAPTER_EVENTS.DISCONNECTED, disconnectedHandler)
      }
    })()
  }, [])

  const login = async () => {
    if (!safeAuth) return

    const signInInfo = await safeAuth.signIn()
    console.log('SIGN IN RESPONSE: ', signInInfo)

    const userInfo = await safeAuth.getUserInfo()
    console.log('USER INFO: ', userInfo)

    setSafeAuthSignInResponse(signInInfo)
    setUserInfo(userInfo || undefined)
    setProvider(safeAuth.getProvider() as SafeEventEmitterProvider)
  }

  const logout = async () => {
    if (!safeAuth) return

    await safeAuth.signOut()

    setProvider(null)
    setSafeAuthSignInResponse(null)
  }

  return (
    <>
      <AppBar onLogin={login} onLogout={logout} userInfo={userInfo} isLoggedIn={!!provider} />
      {safeAuthSignInResponse?.eoa && (
        <div>
            <Typography variant="h3" color="secondary" fontWeight={700}>
              Owner account
            </Typography>
            <Divider sx={{ my: 3 }} />
            <EthHashInfo
              address={safeAuthSignInResponse.eoa}
              
              showPrefix
              prefix={getPrefix('0x5')}
            />
          <div className = "box" style={{marginTop:50,width:2500,height:300}}><br/><br/><br/>
<div className="box1" style={{display:'inline-block',marginLeft:290, backgroundColor:'green',height:300,width:300,borderRadius:5}}><img src={Not}/>
<h2 style={{marginLeft:70,textDecoration:'none',color:'#6be880'}}>Pool Together</h2></div>
<a href="/"><div className="box1" style={{display:'inline-block',marginLeft:155, backgroundColor:'green',height:300,width:300,borderRadius:5}}><img src={Not}/>
<h2 style={{marginLeft:125,textDecoration:'none',color:'#6be880'}}>Aave</h2></div></a>
<a href="/"><div className="box1" style={{display:'inline-block',marginLeft:150, backgroundColor:'green',height:300,width:300,borderRadius:5}}><img  src={Not}/>
<h2 style={{marginLeft:105,textDecoration:'none',color:'#6be880'}}>Notional</h2>
</div></a>
</div>
        </div>
      )}
    
 

    </>
  )
}

const getPrefix = (chainId: string) => {
  switch (chainId) {
    case '0x1':
      return 'eth'
    case '0x5':
      return 'gor'
    case '0x100':
      return 'gno'
    case '0x137':
      return 'matic'
    default:
      return 'eth'
  }
}

export default App
