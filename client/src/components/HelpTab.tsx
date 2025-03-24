
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

export default function HelpTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Help & Support</h2>
      
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 flex justify-between items-center">
          <div>
            <h3 className="font-medium">FAQ</h3>
            <p className="text-sm text-neutral-500">Frequently asked questions</p>
          </div>
          <FontAwesomeIcon icon={faChevronRight} className="text-neutral-400" />
        </div>

        <div className="p-4 flex justify-between items-center border-t">
          <div>
            <h3 className="font-medium">Contact Support</h3>
            <p className="text-sm text-neutral-500">Get help from our team</p>
          </div>
          <FontAwesomeIcon icon={faChevronRight} className="text-neutral-400" />
        </div>

        <div className="p-4 flex justify-between items-center border-t">
          <div>
            <h3 className="font-medium">Privacy Policy</h3>
            <p className="text-sm text-neutral-500">Read our privacy policy</p>
          </div>
          <FontAwesomeIcon icon={faChevronRight} className="text-neutral-400" />
        </div>

        <div className="p-4 flex justify-between items-center border-t">
          <div>
            <h3 className="font-medium">Terms of Service</h3>
            <p className="text-sm text-neutral-500">Read our terms of service</p>
          </div>
          <FontAwesomeIcon icon={faChevronRight} className="text-neutral-400" />
        </div>
      </div>
    </div>
  );
}
