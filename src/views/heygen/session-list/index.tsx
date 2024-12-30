import type { PaginationProps, TableColumnProps } from '@arco-design/web-react';
import { Button, Card, Table, Tooltip } from '@arco-design/web-react';
import type { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import dayjs from 'dayjs';

import { heygen } from '@/api';

import Row from '@arco-design/web-react/es/Grid/row';
import Col from '@arco-design/web-react/es/Grid/col';
import type { HeygengSessionItem } from '@/api/heygen/type';
const DefaultHeygenKey = 'OGVlOGFlODI2NjQwNDMzNjhmZGYzNDNhYWNjZjc4MzEtMTczNTAxNTIwMw==';

const LogList = () => {
  const columns: TableColumnProps<HeygengSessionItem>[] = [
    {
      title: 'session_id',
      width: 160,
      dataIndex: 'session_id',
    },
    {
      title: 'created_at',
      width: 160,
      dataIndex: 'created_at',
      render: (col) => {
        return dayjs(col * 1000).format('YYYY/MM/DD HH:mm:ss');
      },
    },
    {
      title: 'api_key_type',
      width: 160,
      dataIndex: 'api_key_type',
    },
    {
      title: 'status',
      width: 160,
      dataIndex: 'status',
    },

    {
      title: 'more',
      width: 160,
      fixed: 'right',
      dataIndex: 'operation',
      render: (_, item) => (
        <Row gutter={6}>
          <Col span={10}>
            <Tooltip content='Disconnect'>
              <Button
                type='text'
                icon={<div className='i-lucide:file-edit mr-1 text-12px'></div>}
                onClick={() => fetchDisConnect(item)}
              >
                Disconnect
              </Button>
            </Tooltip>
          </Col>
        </Row>
      ),
    },
  ];

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<HeygengSessionItem[]>([]);
  // const [total, setTotal] = useState<number>(0);
  // const [filter, setFilter] = useState<LogFilter | null>(null);

  useEffect(() => {
    void fetchData();
  }, []);

  const handleTableChange = (pagination: PaginationProps, sorter: SorterInfo | SorterInfo[]) => {
    // TODO: 后端做排序
    console.log(pagination, sorter);
    const { current, pageSize } = pagination;

    if (current !== page || pageSize !== limit) {
      setPage(current ?? 1);
      setLimit(pageSize ?? 10);
    }
  };

  const fetchData = async () => {
    setLoading(true);

    // let params: ListParams & LogFilter = {
    //   page,
    //   limit,
    // };

    // if (filter) {
    //   params = { ...params, ...filter };
    // }

    // if (filter?.create_time) {
    //   const [start_time, end_time] = filter.create_time;
    //   params.start_time = start_time;
    //   params.end_time = end_time;
    // }

    try {
      const {
        // code,
        data: { sessions },
        // message,
      } = await heygen.getHeygenSessionList(DefaultHeygenKey);
      // console.log(res);
      if (sessions?.length) {
        setList(sessions);
        //   setTotal(result.total);
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDisConnect = async (item: HeygengSessionItem) => {
    const params = {
      session_id: item.session_id,
    };

    try {
      const res = await heygen.closeHeygenSession(DefaultHeygenKey, params);

      console.log(res);
      // if (code === ResultEnum.SUCCESS) {
      //   void fetchData();

      //   // handleCloseModal();

      //   // editorFormRef.clearFields();

      //   Message.success(msg);
      // }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className='container'>
      {/* <SearchForm /> */}
      <section>
        <Card bordered={false} headerStyle={{ textAlign: 'left' }}>
          <Table
            columns={columns}
            data={list}
            loading={loading}
            scroll={{ x: true }}
            border={{ bodyCell: false }}
            pagination={false}
            pagePosition='bottomCenter'
            rowKey='id'
            onChange={handleTableChange}
          />
        </Card>
      </section>
    </section>
  );
};

export default LogList;
