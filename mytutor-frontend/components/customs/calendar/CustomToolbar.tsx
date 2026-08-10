import { DatePicker, Radio, Tooltip } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import { ToolbarProps, View } from "react-big-calendar";
import dayjs from "dayjs";
import { ethiopianLocale } from "@/utils/localize/dayjs.local";

interface RBCToolbarProps extends ToolbarProps {
  children?: any;
  isFirst: boolean;
  setIsFirst: (value: boolean) => void;
}

function RBCToolbar(props: RBCToolbarProps) {
  const {
    view,
    views,
    onView,
    onNavigate,
    children,
    isFirst,
    setIsFirst,
    date,
  } = props;
  const [month, setMonth] = useState(dayjs(date));
  const onChange = (event: any, dateString: any) => {
    setMonth(event);
    if (view === "month" || view === "agenda") {
      onNavigate("DATE", moment(dateString, "YYYY-MM").toDate());
    } else if (view === "week") {
      onNavigate("DATE", moment(dateString, "YYYY-W").toDate());
    } else if (view === "day") {
      onNavigate("DATE", moment(dateString, "YYYY-MM-DD").toDate());
    }
  };

  const goToView = (view: any) => {
    onView(view.target.value);
  };

  const goToBack = () => {
    onNavigate("PREV");
  };
  const goToNext = () => {
    onNavigate("NEXT");
  };

  const goToToday = () => {
    onNavigate("TODAY");
  };

  useEffect(() => {
    // if (isFirst) {
    //   onNavigate("DATE", moment().toDate());
    //   setIsFirst(false);
    // }
  }, []);

  const getPrevButtonTooltip = () => {
    switch (view){
      case 'agenda':
        return "To view Previous Week attendance"
      case 'day':
        return "To view Previous Day attendance"
      case 'month':
        return "To view Previous Month attendance"
      case 'week':
        return "To view Previous Week attendance"
    }
  }

  const getViewTooltip = (view: View) => {
    switch(view){
      case 'month':
        return 'To get Month View'
      case 'day':
        return 'To get Day View'
      case 'week':
        return 'To get Week View'
    }
  }

  const getNextButtonTooltip = () => {
    switch (view){
      case 'agenda':
        return "To view Next Week attendance"
      case 'day':
        return "To view Next Day attendance"
      case 'month':
        return "To view Next Month attendance"
      case 'week':
        return "To view Next Week attendance"
    }
  }

  return (
    <div className="flex flex-col gap-2">
        <div className="flex gap-2 justify-center items-end">
          <div className="font-bold underline text-sm">
            Legend
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-center items-center w-16 sm:w-auto  sm:gap-1">
          <div className="bg-[#FFCB11]  inline w-full sm:w-2 h-2" />
          <div className="text-center text-xs italic text-gray-700"> Submitted </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row  justify-center items-center w-16 sm:w-auto sm:gap-1">
          <div className="bg-[#ED1406]  inline w-full sm:w-2 h-2" />
          <div className="text-center text-xs italic text-gray-700"> Rejected </div></div>
          <div className="flex flex-col-reverse sm:flex-row  justify-center items-center w-16 sm:w-auto sm:gap-1">
          <div className="bg-[#9DD993]  inline w-full sm:w-2 h-2" />
          <div className="text-center text-xs italic text-gray-700"> Accepted </div></div>
          <div className="flex flex-col-reverse sm:flex-row  justify-center items-center w-16 sm:w-auto sm:gap-1">
          <div className="bg-[#1BA804]  inline w-full sm:w-2 h-2" />
          <div className="text-center text-xs italic text-gray-700"> Merged </div></div>
          <div className="flex flex-col-reverse sm:flex-row  justify-center items-center w-16 sm:w-auto sm:gap-1">
          <div className="bg-[#DAD7B9]  inline w-full sm:w-2 h-2" />
          <div className="text-center text-xs italic text-gray-700"> Not started </div></div>
        </div>
      <div className="flex flex-wrap justify-center gap-2 mx-2 mb-2 2xl:justify-between">
        <div className="rbc-btn-group">
          <Tooltip
            color="#FF735C"
            title="To view today's attendance"
          >
            <Radio.Button key="today" onClick={goToToday}>
              Today
            </Radio.Button>
          </Tooltip>
          <Tooltip
            color="#FF735C"
            title={getPrevButtonTooltip()}
          >
            <Radio.Button key="prev" onClick={goToBack}>
              Prev
            </Radio.Button>
          </Tooltip>
          <Tooltip
            color="#FF735C"
            title={getNextButtonTooltip()}
          >
            <Radio.Button key="next" onClick={goToNext}>
              Next
            </Radio.Button>
          </Tooltip>
          {view === "day" && (
            <DatePicker
              key="date-picker"
              defaultValue={month}
              allowClear={false}
              onChange={onChange}
            />
          )}
          {(view === "month" || view === "agenda") && (
            <DatePicker
              key="month-picker"
              defaultValue={month}
              allowClear={false}
              picker="month"
              locale={ethiopianLocale}
              onChange={onChange}
            />
          )}
          {view === "week" && (
            <DatePicker
              key="month-picker"
              defaultValue={month}
              allowClear={false}
              picker="week"
              locale={ethiopianLocale}
              onChange={onChange}
            />
          )}
        </div>
        {children}
        <div className="space-x-1">
          <Radio.Group value={view} onChange={goToView}>
            {(views as View[])?.map((item: any) => (
              <Tooltip
                color="#FF735C"
                key={item}
                title={getViewTooltip(item)}
              >
                <Radio.Button value={item}>{item}</Radio.Button>
              </Tooltip>
            ))}
          </Radio.Group>
        </div>
      </div>
    </div>
  );
}

export default RBCToolbar;
