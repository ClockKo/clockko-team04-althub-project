export default function ProgressBar({ progress = 0 }: { progress?: number }) {
  return (
    <div className="w-full mb-4">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}