import type { Company } from "../../interfaces/Company"

const companiesArray: Company[] = [
    { id: 1, name: 'Apple, Inc. (AAPL)' },
    { id: 2, name: 'Starbucks, Inc. (SBUX)' },
    { id: 3, name: 'Microsoft, Inc. (MSFT)' },
    { id: 4, name: 'Cisco Systems, Inc. (CSCO)' },
    { id: 5, name: 'QUALCOMM Incorporated (QCOM)' },
    { id: 6, name: 'Amazon.com, Inc. (AMZN)' },
    { id: 7, name: 'Tesla, Inc. (TSLA)' },
    { id: 8, name: 'Advanced Micro Devices, Inc. (AMD)' },
]

export default function StocksPage() {
    return (
        <div>
            <h2>Stocks Page</h2>
        </div>
    )
}