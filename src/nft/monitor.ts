import { Client } from 'xrpl';

export async function getAccountNFTs(client: Client, address: string): Promise<any[]> {
    const response = await client.request({
        command: "account_nfts",
        account: address
    });
    return response.result.account_nfts;
}

export async function getNFTBuyOffers(client: Client, nftId: string): Promise<any[]> {
    try {
        const response = await client.request({
            command: "nft_buy_offers",
            nft_id: nftId
        });
        return response.result.offers || [];
    } catch (e) {
        return [];
    }
}

export async function getNFTSellOffers(client: Client, nftId: string): Promise<any[]> {
    try {
        const response = await client.request({
            command: "nft_sell_offers",
            nft_id: nftId
        });
        return response.result.offers || [];
    } catch (e) {
        return [];
    }
}
