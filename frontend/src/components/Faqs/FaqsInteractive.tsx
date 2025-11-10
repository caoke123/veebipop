"use client"
import React, { useState } from "react";
import * as Icon from "@phosphor-icons/react/dist/ssr";

const FaqsInteractive: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | undefined>("how to buy");
  const [activeQuestion, setActiveQuestion] = useState<string | undefined>("");

  const handleActiveTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleActiveQuestion = (question: string) => {
    setActiveQuestion((prev) => (prev === question ? undefined : question));
  };

  return (
    <div className="container">
      <div className="flex justify-between">
        <div className="left w-1/4">
          <div className="menu-tab flex flex-col gap-5">
            {["how to buy", "payment methods", "delivery", "exchanges & returns", "registration", "look after your garments", "contacts"].map(
              (item, index) => (
                <div
                  key={index}
                  className={`tab-item inline-block w-fit heading6 has-line-before text-secondary2 hover:text-black duration-300 ${
                    activeTab === item ? "active" : ""
                  }`}
                  onClick={() => handleActiveTab(item)}
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>
        <div className="right w-2/3">
          <div className={`tab-question flex flex-col gap-5 ${activeTab === "how to buy" ? "active" : ""}`}>
            {["1", "2", "3", "4", "5", "6"].map((q, idx) => (
              <div
                key={`how-${idx}`}
                className={`question-item px-7 py-5 rounded-[20px] overflow-hidden border border-line cursor-pointer ${
                  activeQuestion === q ? "open" : ""
                }`}
                onClick={() => handleActiveQuestion(q)}
              >
                <div className="heading flex items-center justify-between gap-6">
                  <div className="heading6">How does COVID-19 affect my online orders and store purchases?</div>
                  <Icon.CaretRight size={24} />
                </div>
                <div className="content body1 text-secondary">
                  The courier companies have adapted their procedures to guarantee the safety of our employees and our community. We thank you for your patience, as there may be some delays to deliveries.
                  We remind you that you can still find us at Mango.com
                </div>
              </div>
            ))}
          </div>

          <div className={`tab-question flex flex-col gap-5 ${activeTab === "payment methods" ? "active" : ""}`}>
            {["2", "3", "4", "5", "6"].map((q, idx) => (
              <div
                key={`payment-${idx}`}
                className={`question-item px-7 py-5 rounded-[20px] overflow-hidden border border-line cursor-pointer ${
                  activeQuestion === q ? "open" : ""
                }`}
                onClick={() => handleActiveQuestion(q)}
              >
                <div className="heading flex items-center justify-between gap-6">
                  <div className="heading6">{idx % 2 === 0 ? "NEW! Plus sizes for Woman" : "How does COVID-19 affect my online orders and store purchases?"}</div>
                  <Icon.CaretRight size={24} />
                </div>
                <div className="content body1 text-secondary">
                  The courier companies have adapted their procedures to guarantee the safety of our employees and our community. We thank you for your patience, as there may be some delays to deliveries.
                  We remind you that you can still find us at Mango.com and on all our online channels. Our customer services are still there for you, to answer any questions you may have, although due to the current situation, we are operating with longer waiting times.
                </div>
              </div>
            ))}
          </div>

          <div className={`tab-question flex flex-col gap-5 ${activeTab === "delivery" ? "active" : ""}`}>
            {["1", "2", "3", "4", "5", "6"].map((q, idx) => (
              <div
                key={`delivery-${idx}`}
                className={`question-item px-7 py-5 rounded-[20px] overflow-hidden border border-line cursor-pointer ${
                  activeQuestion === q ? "open" : ""
                }`}
                onClick={() => handleActiveQuestion(q)}
              >
                <div className="heading flex items-center justify-between gap-6">
                  <div className="heading6">{idx % 2 === 0 ? "How does COVID-19 affect my online orders and store purchases?" : "NEW! Plus sizes for Woman"}</div>
                  <Icon.CaretRight size={24} />
                </div>
                <div className="content body1 text-secondary">
                  The courier companies have adapted their procedures to guarantee the safety of our employees and our community. We thank you for your patience, as there may be some delays to deliveries.
                  We remind you that you can still find us at Mango.com and on all our online channels. Our customer services are still there for you, to answer any questions you may have, although due to the current situation, we are operating with longer waiting times.
                </div>
              </div>
            ))}
          </div>

          <div className={`tab-question flex flex-col gap-5 ${activeTab === "registration" ? "active" : ""}`}>
            {["1", "2", "3", "4", "5", "6"].map((q, idx) => (
              <div
                key={`registration-${idx}`}
                className={`question-item px-7 py-5 rounded-[20px] overflow-hidden border border-line cursor-pointer ${
                  activeQuestion === q ? "open" : ""
                }`}
                onClick={() => handleActiveQuestion(q)}
              >
                <div className="heading flex items-center justify-between gap-6">
                  <div className="heading6">{idx % 2 === 0 ? "How does COVID-19 affect my online orders and store purchases?" : "NEW! Plus sizes for Woman"}</div>
                  <Icon.CaretRight size={24} />
                </div>
                <div className="content body1 text-secondary">
                  The courier companies have adapted their procedures to guarantee the safety of our employees and our community. We thank you for your patience, as there may be some delays to deliveries.
                  We remind you that you can still find us at Mango.com and on all our online channels. Our customer services are still there for you, to answer any questions you may have, although due to the current situation, we are operating with longer waiting times.
                </div>
              </div>
            ))}
          </div>

          <div className={`tab-question flex flex-col gap-5 ${activeTab === "look after your garments" ? "active" : ""}`}>
            {["2", "3", "4", "5"].map((q, idx) => (
              <div
                key={`care-${idx}`}
                className={`question-item px-7 py-5 rounded-[20px] overflow-hidden border border-line cursor-pointer ${
                  activeQuestion === q ? "open" : ""
                }`}
                onClick={() => handleActiveQuestion(q)}
              >
                <div className="heading flex items-center justify-between gap-6">
                  <div className="heading6">{idx % 2 === 0 ? "NEW! Plus sizes for Woman" : "How does COVID-19 affect my online orders and store purchases?"}</div>
                  <Icon.CaretRight size={24} />
                </div>
                <div className="content body1 text-secondary">
                  The courier companies have adapted their procedures to guarantee the safety of our employees and our community. We thank you for your patience, as there may be some delays to deliveries.
                  We remind you that you can still find us at Mango.com and on all our online channels. Our customer services are still there for you, to answer any questions you may have, although due to the current situation, we are operating with longer waiting times.
                </div>
              </div>
            ))}
          </div>

          <div className={`tab-question flex flex-col gap-5 ${activeTab === "contacts" ? "active" : ""}`}>
            {["1", "2", "3", "4", "5", "6"].map((q, idx) => (
              <div
                key={`contacts-${idx}`}
                className={`question-item px-7 py-5 rounded-[20px] overflow-hidden border border-line cursor-pointer ${
                  activeQuestion === q ? "open" : ""
                }`}
                onClick={() => handleActiveQuestion(q)}
              >
                <div className="heading flex items-center justify-between gap-6">
                  <div className="heading6">{idx % 2 === 0 ? "How does COVID-19 affect my online orders and store purchases?" : "NEW! Plus sizes for Woman"}</div>
                  <Icon.CaretRight size={24} />
                </div>
                <div className="content body1 text-secondary">
                  The courier companies have adapted their procedures to guarantee the safety of our employees and our community. We thank you for your patience, as there may be some delays to deliveries.
                  We remind you that you can still find us at Mango.com and on all our online channels. Our customer services are still there for you, to answer any questions you may have, although due to the current situation, we are operating with longer waiting times.
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqsInteractive;