import './styles/App.css'
import React, { useEffect, useState } from "react"
import { Card, Progress, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { Content } from 'antd/lib/layout/layout'
import { ethers } from 'ethers'
import MyEpicNFT from './artifacts/contracts/MyEpicNFT.sol/MyEpicNFT.json'
import { nftContractAddress } from './config'

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("")
  const [minted, setMinted] = useState(0)
  const [openSeaLink, setOpenSeaLink] = useState(undefined)

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window

    if (!ethereum) {
      console.log("Make sure you have metamask!")
      return
    } else {
      console.log("We have the ethereum object", ethereum)
    }

    let chainId = await ethereum.request({ method: 'eth_chainId' })
    console.log("Connected to chain " + chainId)

    const rinkebyChainId = "0x4"
    if (chainId !== rinkebyChainId) {
      alert("Please switch to the Rinkeby Test Network!")
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' })

    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const connectedContract = new ethers.Contract(nftContractAddress, MyEpicNFT.abi, signer)

    let minted = await connectedContract.totalSupply()
    setMinted(minted.toString())

    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log("Found an authorized account:", account)
      setCurrentAccount(account)

      setupEventListener()
    } else {
      console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert("Get MetaMask!")
        return
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" })

      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0])

      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(nftContractAddress, MyEpicNFT.abi, signer)

        let minted = await connectedContract.totalSupply()
        setMinted(minted.toString())

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          setOpenSeaLink(`https://testnets.opensea.io/assets/${nftContractAddress}/${tokenId.toNumber()}`)
        })

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(nftContractAddress, MyEpicNFT.abi, signer)

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT()

        setOpenSeaLink('loading')

        console.log("Mining...please wait.")
        await nftTxn.wait()

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`)

        let minted = await connectedContract.totalSupply()
        setMinted(minted.toString())
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
    //eslint-disable-next-line
  }, [])

  const mint = minted < 50 ? (
    <>
      <button onClick={askContractToMintNft} className="cta-button connect-wallet-button" style={{ display: 'inline-block' }}>
        Mint NFT
      </button>
      <button style={{ display: 'inline-block' }} className='cta-button connect-wallet-button'><a href='https://testnets.opensea.io/collection/squarenft-mequ7nk5qx' target='_blank' rel="noreferrer">View NFT Collection!</a></button>
    </>
  ) : <button className='cta-button connect-wallet-button'><a href='https://testnets.opensea.io/collection/squarenft-mequ7nk5qx' target='_blank' rel="noreferrer">View NFT Collection!</a></button>

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">SVG NFT Generation</p>
          <p className="sub-text">
            Mint your own unique NFT!
          </p>
          {currentAccount === "" ? (
            <button onClick={connectWallet} className="cta-button connect-wallet-button" style={{ marginBottom: '50px' }} >
              Connect to Wallet
            </button>
          ) : mint}
        </div>
        <Content>
          {currentAccount !== "" && <Card style={{ width: 350, margin: '50px auto', background: '-webkit-linear-gradient(left, #60c657, #35aee2)' }} bordered={false}>
            <Progress percent={Math.round(minted / 50 * 100)} />
            <Card.Meta description={`${minted}/50 NFTs Minted`} />
          </Card>}
          {openSeaLink === 'loading' &&
            <div style={{ margin: '0 auto' }}>
              <Spin indicator={antIcon} tip='Mining...please wait!' />
            </div>
          }
          {openSeaLink !== undefined && openSeaLink !== 'loading' &&
            <button className='cta-button connect-wallet-button' style={{ width: 200, margin: '0 auto 50px' }}>
              <a onClick={() => alert('It may take up to 10 minutes for NFT to appear on OpenSea')} href={openSeaLink} target='_blank' rel='noopener noreferrer'>View NFT!</a>
            </button>
          }
          <button
            className='cta-button connect-wallet-button'
            style={{ display: 'block', width: 300, margin: '0 auto' }}>
            Created by <a href='https://starkemedia.com' target='_blank' rel="noreferrer">StarkeMedia</a>
          </button>
        </Content>
      </div>
    </div >
  )
}

export default App
