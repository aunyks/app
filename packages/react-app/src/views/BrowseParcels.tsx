import React from "react";
import { Col, Layout } from "antd";
import { Content } from "antd/lib/layout/layout";

import { Transactor } from "../helpers";
import { useUpdateParcels, useUserSigner, useContractLoader, useAppSelector, useAppDispatch } from "../hooks";
import { ParcelMap } from "../components";
import { setParcels } from "../actions";
import ParcelTabs from "../components/ParcelTabs";

interface Props {
  injectedProvider: any;
}

export default function BrowseParcels({ injectedProvider }: Props) {
  const dispatch = useAppDispatch();
  const parcels = useAppSelector(state => state.parcels.parcels);
  const userAddress = useAppSelector(state => state.user.address);
  const DEBUG = useAppSelector(state => state.debug.debug);
  const gasPrice = useAppSelector(state => state.network.gasPrice);

  const userSigner = useUserSigner(injectedProvider);
  const contracts: any = useContractLoader(injectedProvider);

  const tx = Transactor(userSigner, gasPrice);
  useUpdateParcels(contracts, DEBUG).then(newParcels => {
    if (newParcels.length !== parcels.length) dispatch(setParcels(newParcels));
  });

  const useBuyParcel = async (id: number) => {
    tx && (await tx(contracts.CityDaoParcel.mintParcel(userAddress, id)));
    useUpdateParcels(contracts, DEBUG).then(newParcels => {
      dispatch(setParcels(newParcels));
    });
  };

  return (
    <div className="flex flex-row flex-grow">
      <Col>
        <ParcelTabs />
      </Col>
      <Layout className="site-layout">
        <Content className="flex flex-col">
          {/* key prop is to cause rerendering whenever it changes */}
          <ParcelMap
            key={parcels.length}
            parcels={parcels}
            startingCoordinates={[-106.331, 43.172]}
            startingZoom={9}
            buyParcel={useBuyParcel}
          />
        </Content>
      </Layout>
    </div>
  );
}
