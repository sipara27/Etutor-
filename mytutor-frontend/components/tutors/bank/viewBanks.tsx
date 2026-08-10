import { Bank } from "@/types/BankItem";
import { useEffect, useState } from "react";
import useBankService from "./BankService";
import { List } from "antd";

const ViewBanksList = () => {
  const [bankData, setBankData] = useState<Bank[]>();
  const bankService = useBankService();

  useEffect(() => {
    getBank("");
  }, []);

  const getBank = (search: string) => {
    bankService.getBanks({ search }).then((value) => {
      setBankData(value.data.results);
    });
  };
  
  return (
    <div>
      <div>
        <h1 className="font-bold text-2xl">Bank Lists</h1>
      </div>
      <div>
        <List
          itemLayout="horizontal"
          dataSource={bankData}
          pagination={{
            onChange: (page) => {
              console.log(page);
            },
            pageSize: 5,
          }}
          renderItem={(item: Bank, index) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <div className="flex space-x-10">
                    <div>{item.bank_name} </div>
                    <div>{item.account_number}</div>
                  </div>
                }
                description={item.description}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default ViewBanksList;
